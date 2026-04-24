from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Document, Permission, AuditLog, UserProfile, Version, ShareLink
from .utils import get_client_ip, encrypt_token, decrypt_token, log_action, _cipher

REGISTER_URL = '/api/auth/register/'
DOCUMENTS_URL = '/api/documents/'
LOGIN_URL = '/api/login/'
PROFILE_URL = '/api/auth/profile/'
CHANGE_PASSWORD_URL = '/api/auth/change-password/'
REFRESH_URL = '/api/auth/refresh/'
DOC_STR_NAME = 'Doc Str'


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@test.com', password='testpass123')

    def test_login_exitoso(self):
        response = self.client.post(LOGIN_URL, {'username': 'testuser', 'password': 'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_credenciales_invalidas(self):
        response = self.client.post(LOGIN_URL, {'username': 'testuser', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_usuario(self):
        response = self.client.post(REGISTER_URL, {
            'username': 'newuser', 'email': 'new@test.com', 'password': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_registro_usuario_duplicado(self):
        self.client.post(REGISTER_URL, {
            'username': 'dupeuser', 'email': 'dupe@test.com', 'password': 'pass12345'
        })
        response = self.client.post(REGISTER_URL, {
            'username': 'dupeuser', 'email': 'other@test.com', 'password': 'pass12345'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_sin_campos_requeridos(self):
        response = self.client.post(REGISTER_URL, {'username': 'nopass'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DocumentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='owner', email='owner@test.com', password='pass12345')
        self.other = User.objects.create_user(username='other', email='other@test.com', password='pass12345')
        self.client.force_authenticate(user=self.owner)

    def _create_document(self, name='Mi documento'):
        return self.client.post(DOCUMENTS_URL, {'name': name})

    def test_crear_documento(self):
        response = self._create_document()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.owner.id)

    def test_listar_documentos_propios(self):
        self._create_document('Doc A')
        self._create_document('Doc B')
        response = self.client.get(DOCUMENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_no_ver_documentos_ajenos(self):
        self.client.force_authenticate(user=self.other)
        self._create_document()
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(DOCUMENTS_URL)
        self.assertEqual(len(response.data), 0)

    def test_solo_dueno_puede_eliminar(self):
        self._create_document()
        doc = Document.objects.get(owner=self.owner)
        self.client.force_authenticate(user=self.other)
        response = self.client.delete(f'/api/documents/{doc.id}/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_compartir_documento(self):
        self._create_document()
        doc = Document.objects.get(owner=self.owner)
        response = self.client.post(f'/api/documents/{doc.id}/share/', {
            'email': self.other.email, 'role': 'lector'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Permission.objects.filter(document=doc, user=self.other).exists())

    def test_no_compartir_consigo_mismo(self):
        self._create_document()
        doc = Document.objects.get(owner=self.owner)
        response = self.client.post(f'/api/documents/{doc.id}/share/', {
            'email': self.owner.email, 'role': 'lector'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_documento_sin_autenticacion(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(DOCUMENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LockTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='lockowner', email='lockowner@test.com', password='pass12345')
        self.other = User.objects.create_user(username='lockother', email='lockother@test.com', password='pass12345')
        self.client.force_authenticate(user=self.owner)
        self.client.post(DOCUMENTS_URL, {'name': 'Doc Lock'})
        self.doc = Document.objects.get(owner=self.owner)

    def test_adquirir_lock(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.status, 'bloqueado')

    def test_otro_usuario_no_puede_adquirir_lock(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_409_CONFLICT])

    def test_liberar_lock(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        response = self.client.post(f'/api/documents/{self.doc.id}/release_lock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.status, 'disponible')


class AuditLogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin', email='admin@test.com', password='admin12345')
        self.user = User.objects.create_user(username='regular', email='regular@test.com', password='pass12345')

    def test_admin_puede_ver_audit(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/audit/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_usuario_regular_no_puede_ver_audit(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/audit/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ModelStrTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='struser', email='str@test.com', password='pass12345')
        self.doc = Document.objects.create(name=DOC_STR_NAME, owner=self.user)

    def test_userprofile_str(self):
        profile = UserProfile.objects.create(user=self.user)
        self.assertIn('struser', str(profile))

    def test_document_str(self):
        self.assertIn(DOC_STR_NAME, str(self.doc))

    def test_version_str(self):
        v = Version.objects.create(document=self.doc, version_number='v1.1', content='', author=self.user)
        self.assertIn(DOC_STR_NAME, str(v))
        self.assertIn('v1.1', str(v))

    def test_permission_str(self):
        other = User.objects.create_user(username='strother', email='strother@test.com', password='pass12345')
        perm = Permission.objects.create(document=self.doc, user=other, role='lector')
        self.assertIn('strother', str(perm))

    def test_sharelink_str(self):
        link = ShareLink.objects.create(document=self.doc, role='viewer', created_by=self.user)
        self.assertIn(DOC_STR_NAME, str(link))

    def test_auditlog_str(self):
        log = AuditLog.objects.create(user=self.user, action='TEST', host='127.0.0.1', target='test')
        self.assertIn('TEST', str(log))


class UtilsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='utilsuser', email='utils@test.com', password='pass12345')

    def test_get_client_ip_remote_addr(self):
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.META['REMOTE_ADDR'] = '192.168.1.1'
        self.assertEqual(get_client_ip(request), '192.168.1.1')

    def test_get_client_ip_forwarded(self):
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1, 192.168.1.1'
        self.assertEqual(get_client_ip(request), '10.0.0.1')

    def test_encrypt_decrypt_roundtrip(self):
        original = 'test-value-123'
        encrypted = encrypt_token(original)
        self.assertNotEqual(encrypted, original)
        decrypted = decrypt_token(encrypted)
        self.assertEqual(decrypted, original)

    def test_decrypt_invalid_token(self):
        result = decrypt_token('invalid-token-xyz')
        self.assertIsNone(result)

    def test_cipher_fallback_no_key(self):
        from unittest.mock import patch
        with patch('core.utils.settings') as mock_settings:
            mock_settings.FERNET_KEY = None
            cipher = _cipher()
            self.assertIsNotNone(cipher)

    def test_log_action_creates_auditlog(self):
        from django.test import RequestFactory
        factory = RequestFactory()
        request = factory.get('/')
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        request.user = self.user
        count_before = AuditLog.objects.count()
        log_action(request, 'TEST_ACTION', 'test_target')
        self.assertEqual(AuditLog.objects.count(), count_before + 1)



class ProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='profuser', email='prof@test.com', password='pass12345')
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get(PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'profuser')

    def test_patch_profile(self):
        response = self.client.patch(PROFILE_URL, {'first_name': 'Nuevo', 'last_name': 'Apellido', 'age': 25, 'gender': 'masculino'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Nuevo')

    def test_patch_email_duplicado(self):
        User.objects.create_user(username='otro2', email='otro2@test.com', password='pass12345')
        response = self.client.patch(PROFILE_URL, {'email': 'otro2@test.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_profile_sin_perfil_previo(self):
        user2 = User.objects.create_user(username='noprofile', email='noprofile@test.com', password='pass12345')
        self.client.force_authenticate(user=user2)
        response = self.client.get(PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_exitoso(self):
        response = self.client.post(CHANGE_PASSWORD_URL, {
            'current_password': 'pass12345', 'new_password': 'nuevapass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_incorrecta(self):
        response = self.client.post(CHANGE_PASSWORD_URL, {
            'current_password': 'wrongpass', 'new_password': 'nuevapass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_demasiado_corta(self):
        response = self.client.post(CHANGE_PASSWORD_URL, {
            'current_password': 'pass12345', 'new_password': 'corta'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RefreshTokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='refreshuser', email='refresh@test.com', password='pass12345')

    def test_refresh_token_exitoso(self):
        login = self.client.post(LOGIN_URL, {'username': 'refreshuser', 'password': 'pass12345'})
        response = self.client.post(REFRESH_URL, {'refresh': login.data['refresh']})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_token_invalido(self):
        response = self.client.post(REFRESH_URL, {'refresh': 'token_invalido'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_sin_token(self):
        response = self.client.post(REFRESH_URL, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RegisterEdgeCasesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registro_con_telefono_duplicado(self):
        self.client.post(REGISTER_URL, {'username': 'u1', 'email': 'u1@test.com', 'password': 'pass12345', 'phone': '5511111111'})
        response = self.client.post(REGISTER_URL, {'username': 'u2', 'email': 'u2@test.com', 'password': 'pass12345', 'phone': '5511111111'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_email_duplicado(self):
        self.client.post(REGISTER_URL, {'username': 'u3', 'email': 'dup@test.com', 'password': 'pass12345'})
        response = self.client.post(REGISTER_URL, {'username': 'u4', 'email': 'dup@test.com', 'password': 'pass12345'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_con_edad_y_genero(self):
        response = self.client.post(REGISTER_URL, {
            'username': 'u5', 'email': 'u5@test.com', 'password': 'pass12345',
            'age': 25, 'gender': 'masculino', 'first_name': 'Nombre', 'last_name': 'Apellido'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class DocumentActionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='actowner', email='actowner@test.com', password='pass12345')
        self.editor = User.objects.create_user(username='acteditor', email='acteditor@test.com', password='pass12345')
        self.other = User.objects.create_user(username='actother', email='actother@test.com', password='pass12345')
        self.client.force_authenticate(user=self.owner)
        self.client.post(DOCUMENTS_URL, {'name': 'Action Doc'})
        self.doc = Document.objects.get(owner=self.owner)

    def test_share_usuario_no_encontrado(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/share/', {
            'email': 'noexiste@test.com', 'role': 'lector'
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_share_no_dueno(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/share/', {
            'email': self.editor.email, 'role': 'lector'
        })
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_my_invitations_vacia(self):
        self.client.force_authenticate(user=self.editor)
        response = self.client.get('/api/documents/my_invitations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_my_invitations_con_pendiente(self):
        self.client.post(f'/api/documents/{self.doc.id}/share/', {'email': self.editor.email, 'role': 'editor'})
        self.client.force_authenticate(user=self.editor)
        response = self.client.get('/api/documents/my_invitations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_accept_invitation(self):
        self.client.post(f'/api/documents/{self.doc.id}/share/', {'email': self.editor.email, 'role': 'editor'})
        perm = Permission.objects.get(document=self.doc, user=self.editor)
        self.client.force_authenticate(user=self.editor)
        response = self.client.post('/api/documents/accept_invitation/', {'permission_id': perm.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'accepted')

    def test_accept_invitation_no_encontrada(self):
        self.client.force_authenticate(user=self.editor)
        response = self.client.post('/api/documents/accept_invitation/', {'permission_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reject_invitation(self):
        self.client.post(f'/api/documents/{self.doc.id}/share/', {'email': self.editor.email, 'role': 'editor'})
        perm = Permission.objects.get(document=self.doc, user=self.editor)
        self.client.force_authenticate(user=self.editor)
        response = self.client.post('/api/documents/reject_invitation/', {'permission_id': perm.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reject_invitation_no_encontrada(self):
        self.client.force_authenticate(user=self.editor)
        response = self.client.post('/api/documents/reject_invitation/', {'permission_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_revoke_permission(self):
        self.client.post(f'/api/documents/{self.doc.id}/share/', {'email': self.editor.email, 'role': 'editor'})
        response = self.client.post(f'/api/documents/{self.doc.id}/revoke_permission/', {'user_id': self.editor.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revoke_permission_no_encontrada(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/revoke_permission/', {'user_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_revoke_permission_no_dueno(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/revoke_permission/', {'user_id': self.editor.id})
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_heartbeat_con_lock(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        response = self.client.post(f'/api/documents/{self.doc.id}/heartbeat/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_heartbeat_sin_lock(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/heartbeat/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_autosave_con_lock(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        response = self.client.post(f'/api/documents/{self.doc.id}/autosave/', {'content': '<p>contenido</p>'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_autosave_sin_lock(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/autosave/', {'content': '<p>contenido</p>'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_save_version(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        response = self.client.post(f'/api/documents/{self.doc.id}/save_version/', {
            'content': '<p>v1.1</p>', 'note': 'Primera versión guardada'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], 'v1.1')

    def test_save_version_sin_permiso(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/save_version/', {'content': '<p>x</p>'})
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_generate_share_link(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/generate_share_link/', {'role': 'viewer'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)

    def test_generate_share_link_editor(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/generate_share_link/', {'role': 'editor'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_share_link_rol_invalido(self):
        response = self.client.post(f'/api/documents/{self.doc.id}/generate_share_link/', {'role': 'admin'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generate_share_link_no_dueno(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/generate_share_link/', {'role': 'viewer'})
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_public_document_view(self):
        link = ShareLink.objects.create(document=self.doc, role='viewer', created_by=self.owner)
        token = encrypt_token(str(link.token))
        self.client.force_authenticate(user=None)
        response = self.client.get(f'/api/share/{token}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Action Doc')

    def test_public_document_view_token_invalido(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/share/token-totalmente-invalido/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_release_lock_sin_ser_dueno(self):
        self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.client.force_authenticate(user=self.other)
        response = self.client.post(f'/api/documents/{self.doc.id}/release_lock/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_acquire_lock_editor_con_permiso(self):
        perm = Permission.objects.create(document=self.doc, user=self.editor, role='editor', status='aceptado')
        self.client.force_authenticate(user=self.editor)
        response = self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        perm.delete()

    def test_acquire_lock_expirado(self):
        from django.utils import timezone
        from datetime import timedelta
        self.doc.status = 'bloqueado'
        self.doc.locked_by = self.other
        self.doc.last_heartbeat = timezone.now() - timedelta(seconds=200)
        self.doc.save()
        response = self.client.post(f'/api/documents/{self.doc.id}/acquire_lock/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_eliminar_documento_dueno(self):
        response = self.client.delete(f'/api/documents/{self.doc.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class UserSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='searcher', email='searcher@test.com', password='pass12345')
        User.objects.create_user(username='target', email='target@example.com', password='pass12345')
        self.client.force_authenticate(user=self.user)

    def test_listar_usuarios(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_buscar_usuario_por_email(self):
        response = self.client.get('/api/users/?search=target')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any('target' in u.get('email', '') for u in response.data))
