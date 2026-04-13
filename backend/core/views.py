from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Document, Version, Permission, ShareLink, AuditLog
from .serializers import DocumentSerializer, VersionSerializer, UserSerializer, PermissionSerializer, AuditLogSerializer
from .utils import log_action, encrypt_token, decrypt_token


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        q = self.request.query_params.get('search', '').strip()
        qs = User.objects.exclude(id=self.request.user.id)
        if q:
            qs = qs.filter(email__icontains=q)
        return qs[:10]


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        owned = Document.objects.filter(owner=user)
        shared = Document.objects.filter(permissions__user=user, permissions__status='aceptado')
        return (owned | shared).distinct()

    def perform_create(self, serializer):
        doc = serializer.save(owner=self.request.user)
        log_action(self.request, 'CREATE_DOCUMENT', doc.name)

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        if doc.owner != request.user:
            return Response({'error': 'Solo el dueño puede eliminar este documento'}, status=status.HTTP_403_FORBIDDEN)
        log_action(request, 'DELETE_DOCUMENT', doc.name)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        doc = self.get_object()
        if doc.owner != request.user:
            return Response({'error': 'Solo el dueño puede compartir este documento'}, status=status.HTTP_403_FORBIDDEN)
        try:
            target_user = User.objects.get(email=request.data.get('email'))
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if target_user == request.user:
            return Response({'error': 'No puedes compartir contigo mismo'}, status=status.HTTP_400_BAD_REQUEST)
        perm, _ = Permission.objects.update_or_create(
            document=doc, user=target_user,
            defaults={'role': request.data.get('role', 'lector'), 'status': 'pendiente'}
        )
        log_action(request, 'SHARE_DOCUMENT', f"{doc.name} -> {target_user.username}")
        return Response(PermissionSerializer(perm).data)

    @action(detail=True, methods=['post'])
    def revoke_permission(self, request, pk=None):
        doc = self.get_object()
        if doc.owner != request.user:
            return Response({'error': 'Solo el dueño puede revocar permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            Permission.objects.get(document=doc, user__id=request.data.get('user_id')).delete()
            return Response({'status': 'revoked'})
        except Permission.DoesNotExist:
            return Response({'error': 'Permiso no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_invitations(self, request):
        perms = Permission.objects.filter(user=request.user, status='pendiente').select_related('document__owner')
        return Response([{
            'permission_id': p.id, 'document_name': p.document.name,
            'owner': p.document.owner.username, 'role': p.role, 'granted_at': p.granted_at
        } for p in perms])

    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        try:
            perm = Permission.objects.get(id=request.data.get('permission_id'), user=request.user)
            perm.status = 'aceptado'
            perm.save()
            log_action(request, 'ACCEPT_INVITATION', perm.document.name)
            return Response({'status': 'accepted', 'document_id': perm.document.id})
        except Permission.DoesNotExist:
            return Response({'error': 'Invitación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def reject_invitation(self, request):
        try:
            perm = Permission.objects.get(id=request.data.get('permission_id'), user=request.user, status='pendiente')
            perm.delete()
            return Response({'status': 'rejected'})
        except Permission.DoesNotExist:
            return Response({'error': 'Invitación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def acquire_lock(self, request, pk=None):
        doc = self.get_object()
        user = request.user
        has_perm = doc.owner == user or Permission.objects.filter(document=doc, user=user, role__in=['editor', 'admin'], status='aceptado').exists()
        if not has_perm:
            return Response({'error': 'Sin permisos de edición'}, status=status.HTTP_403_FORBIDDEN)
        now = timezone.now()
        if doc.status == 'bloqueado' and doc.locked_by != user:
            expired = not doc.last_heartbeat or (now - doc.last_heartbeat).total_seconds() > 120
            if not expired:
                return Response({'error': 'bloqueado', 'locked_by': doc.locked_by.username,
                                 'message': f'{doc.locked_by.username} está editando este documento.'}, status=status.HTTP_409_CONFLICT)
        doc.status = 'bloqueado'
        doc.locked_by = user
        doc.last_heartbeat = now
        doc.save()
        log_action(request, 'ACQUIRE_LOCK', doc.name)
        return Response({'status': 'locked', 'locked_by': user.username})

    @action(detail=True, methods=['post'])
    def release_lock(self, request, pk=None):
        doc = self.get_object()
        if doc.locked_by != request.user and not request.user.is_staff:
            return Response({'error': 'No puedes liberar este bloqueo'}, status=status.HTTP_403_FORBIDDEN)
        doc.status = 'disponible'
        doc.locked_by = None
        doc.last_heartbeat = None
        doc.save()
        return Response({'status': 'unlocked'})

    @action(detail=True, methods=['post'])
    def heartbeat(self, request, pk=None):
        doc = self.get_object()
        if doc.status == 'bloqueado' and doc.locked_by == request.user:
            doc.last_heartbeat = timezone.now()
            doc.save()
            return Response({'status': 'ok'})
        return Response({'error': 'No posees el bloqueo'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'])
    def autosave(self, request, pk=None):
        doc = self.get_object()
        if doc.status != 'bloqueado' or doc.locked_by != request.user:
            return Response({'error': 'No posees el bloqueo'}, status=status.HTTP_403_FORBIDDEN)
        doc.content = request.data.get('content', doc.content)
        doc.save()
        return Response({'status': 'saved'})

    @action(detail=True, methods=['post'])
    def save_version(self, request, pk=None):
        doc = self.get_object()
        user = request.user
        has_perm = doc.owner == user or Permission.objects.filter(document=doc, user=user, role__in=['editor', 'admin'], status='aceptado').exists()
        if not has_perm:
            return Response({'error': 'Sin permisos para guardar versiones'}, status=status.HTTP_403_FORBIDDEN)
        if doc.status == 'bloqueado' and doc.locked_by != user:
            return Response({'error': 'Documento bloqueado por otro usuario'}, status=status.HTTP_403_FORBIDDEN)
        try:
            next_v = f"v{float(doc.version.replace('v', '')) + 0.1:.1f}"
        except ValueError:
            next_v = "v1.1"
        content = request.data.get('content', doc.content)
        Version.objects.create(document=doc, version_number=next_v, content=content, author=user, note=request.data.get('note', ''))
        doc.content = content
        doc.version = next_v
        doc.last_mod = timezone.now()
        doc.save()
        log_action(request, 'SAVE_VERSION', f"{doc.name} {next_v}")
        return Response(DocumentSerializer(doc).data)

    @action(detail=True, methods=['post'])
    def generate_share_link(self, request, pk=None):
        doc = self.get_object()
        if doc.owner != request.user:
            return Response({'error': 'Solo el dueño puede generar links'}, status=status.HTTP_403_FORBIDDEN)
        role = request.data.get('role', 'viewer')
        if role not in ['editor', 'viewer']:
            return Response({'error': 'Rol inválido'}, status=status.HTTP_400_BAD_REQUEST)
        link = ShareLink.objects.create(document=doc, role=role, created_by=request.user)
        encrypted = encrypt_token(str(link.token))
        log_action(request, 'GENERATE_SHARE_LINK', f"{doc.name} ({role})")
        return Response({'token': encrypted, 'role': link.role})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_document_view(request, token):
    uuid_str = decrypt_token(token)
    if not uuid_str:
        return Response({'error': 'Link inválido o expirado'}, status=status.HTTP_404_NOT_FOUND)
    try:
        link = ShareLink.objects.select_related('document__owner').get(token=uuid_str)
    except (ShareLink.DoesNotExist, Exception):
        return Response({'error': 'Link inválido o expirado'}, status=status.HTTP_404_NOT_FOUND)
    doc = link.document
    log_action(request, 'PUBLIC_VIEW', doc.name)
    return Response({
        'id': doc.id, 'name': doc.name, 'content': doc.content,
        'role': link.role, 'owner': doc.owner.username,
        'version': doc.version, 'last_mod': doc.last_mod.strftime('%Y-%m-%d') if doc.last_mod else '',
    })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all()
