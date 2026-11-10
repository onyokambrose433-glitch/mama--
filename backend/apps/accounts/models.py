from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email is required'))
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', CustomUser.Role.SUPER_ADMIN)
        extra_fields.setdefault('is_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'super_admin', _('Super Administrator')
        STORE_MANAGER = 'store_manager', _('Store Manager')
        INVENTORY_MANAGER = 'inventory_manager', _('Inventory Manager')
        ORDER_MANAGER = 'order_manager', _('Order Manager')
        ACCOUNTANT = 'accountant', _('Accountant')
        DELIVERY_MANAGER = 'delivery_manager', _('Delivery Manager')
        CUSTOMER = 'customer', _('Customer')

    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.CUSTOMER)
    is_verified = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    @property
    def is_admin_or_staff(self):
        return self.is_superuser or self.role in [
            self.Role.SUPER_ADMIN,
            self.Role.STORE_MANAGER,
            self.Role.INVENTORY_MANAGER,
            self.Role.ORDER_MANAGER,
            self.Role.ACCOUNTANT,
            self.Role.DELIVERY_MANAGER
        ]


class Address(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=30)
    street_address = models.CharField(max_length=255)
    division_or_area = models.CharField(max_length=120, help_text="e.g. Kololo, Nakawa, Kira, Ntinda, etc.")
    city = models.CharField(max_length=100, default="Kampala")
    delivery_instructions = models.TextField(blank=True, help_text="Gate color, landmark, directions")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        if self.is_default:
            # Unmark other default addresses for this user
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.division_or_area}, {self.city}"


class AuditLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.email if self.user else "System"
        return f"{self.timestamp:%Y-%m-%d %H:%M} | {user_str} | {self.action} on {self.target_model}"
