from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, Version, Permission, AuditLog


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class VersionSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Version
        fields = ['id', 'version_number', 'content', 'date', 'author', 'author_name', 'note']


class PermissionSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Permission
        fields = ['id', 'user', 'user_name', 'user_email', 'role', 'status', 'granted_at']


class DocumentSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.username')
    locked_by_name = serializers.ReadOnlyField(source='locked_by.username')
    versions = VersionSerializer(many=True, read_only=True)
    permissions = PermissionSerializer(many=True, read_only=True)
    last_mod = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'name', 'owner', 'owner_name', 'status', 'locked_by', 'locked_by_name',
                  'last_mod', 'version', 'content', 'versions', 'permissions']
        read_only_fields = ['owner', 'locked_by', 'status', 'version', 'last_mod']


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = AuditLog
        fields = ['id', 'username', 'action', 'host', 'target', 'timestamp']
