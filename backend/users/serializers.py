from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'age', 'gender', 'phone']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False, 'allow_blank': True},
            'phone': {'required': True, 'allow_blank': False},
        }

    def validate_phone(self, value):
        digits = ''.join(ch for ch in str(value) if ch.isdigit())
        if digits.startswith('91') and len(digits) == 12:
            digits = digits[2:]
        if len(digits) != 10:
            raise serializers.ValidationError('Enter a valid 10 digit phone number.')
        return f'+91{digits}'

    def validate(self, attrs):
        phone = attrs.get('phone')
        attrs['username'] = attrs.get('username') or phone
        attrs['email'] = attrs.get('email') or f'{phone.replace("+", "")}@demo.local'

        if User.objects.filter(username=attrs['username']).exists() or User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({
                'phone': 'This phone number already has an account. Please log in instead.'
            })
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                'email': 'This email is already used by another account.'
            })
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            gender=validated_data.get('gender'),
            phone=validated_data.get('phone'),
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'age', 'gender', 'phone']
