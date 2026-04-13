from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from ..serializers import UserSerializer
from ..models import UserProfile
from ..utils import log_action


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
    if not user:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)
    refresh = RefreshToken.for_user(user)
    log_action(request, 'LOGIN', user.username)
    return Response({'access': str(refresh.access_token), 'refresh': str(refresh), 'user': UserSerializer(user).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone')
    age = request.data.get('age')
    gender = request.data.get('gender')

    if not (username and email and password):
        return Response({'error': 'Usuario, correo y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'El nombre de usuario ya está en uso.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'El correo electrónico ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)
    if phone and UserProfile.objects.filter(phone=phone).exists():
        return Response({'error': 'Este número de teléfono ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            is_active=True
        )
        UserProfile.objects.create(
            user=user,
            phone=phone or None,
            age=int(age) if age else None,
            gender=gender or ''
        )
        refresh = RefreshToken.for_user(user)
        log_action(request, 'REGISTER', username)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh), 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    except Exception:
        return Response({'error': 'Error al crear la cuenta.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({'error': 'El refresh token es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        return Response({'access': str(RefreshToken(refresh).access_token)})
    except (InvalidToken, TokenError):
        return Response({'error': 'Token inválido o expirado.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)

    if request.method == 'GET':
        return Response({
            'id': user.id, 'username': user.username, 'email': user.email,
            'first_name': user.first_name, 'last_name': user.last_name,
            'phone': profile.phone or '', 'age': profile.age, 'gender': profile.gender or '',
        })

    new_email = request.data.get('email', user.email)
    if new_email != user.email and User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
        return Response({'error': 'El correo ya está en uso.'}, status=status.HTTP_400_BAD_REQUEST)

    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.email = new_email
    user.save()
    profile.phone = request.data.get('phone') or None
    profile.age = request.data.get('age') or None
    profile.gender = request.data.get('gender', profile.gender)
    profile.save()
    log_action(request, 'UPDATE_PROFILE', user.username)
    return Response({
        'id': user.id, 'username': user.username, 'email': user.email,
        'first_name': user.first_name, 'last_name': user.last_name,
        'phone': profile.phone or '', 'age': profile.age, 'gender': profile.gender or '',
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    user = request.user
    if not user.check_password(request.data.get('current_password', '')):
        return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
    new_password = request.data.get('new_password', '')
    if len(new_password) < 8:
        return Response({'error': 'La nueva contraseña debe tener al menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    log_action(request, 'CHANGE_PASSWORD', user.username)
    return Response({'message': 'Contraseña actualizada correctamente.'})
