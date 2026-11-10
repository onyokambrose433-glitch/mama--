import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates or updates the initial Super Administrator for Mama Shopping Center'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default=os.getenv('ADMIN_EMAIL', 'admin@mamashoppingcenter.com'))
        parser.add_argument('--password', type=str, default=os.getenv('ADMIN_PASSWORD', 'MamaAdmin2026!'))
        parser.add_argument('--first_name', type=str, default='Mama')
        parser.add_argument('--last_name', type=str, default='Administrator')
        parser.add_argument('--phone', type=str, default='+256700892100')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        phone = options['phone']

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'role': User.Role.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.role = User.Role.SUPER_ADMIN
        user.is_verified = True
        user.save()

        action = "Created" if created else "Updated existing"
        self.stdout.write(self.style.SUCCESS(
            f"✓ {action} Super Administrator: {email}\n"
            f"  Role: Super Administrator (Role-based access & Django Admin access)"
        ))
