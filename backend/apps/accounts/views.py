from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .models import Address, AuditLog
from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer,
    AddressSerializer, StaffCreateUpdateSerializer, AuditLogSerializer
)
from .permissions import IsAdminOrStaff, IsSuperAdmin, IsOwnerOrAdmin

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Account created successfully.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if not user:
            # Check if user exists with inactive account
            if User.objects.filter(email=email, is_active=False).exists():
                return Response({"detail": "This account has been deactivated. Please contact support."}, status=status.HTTP_403_FORBIDDEN)
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        })


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": "Wrong current password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password updated successfully."})


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# Staff & Admin Management
class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffCreateUpdateSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return User.objects.filter(role__in=[
            User.Role.SUPER_ADMIN,
            User.Role.STORE_MANAGER,
            User.Role.INVENTORY_MANAGER,
            User.Role.ORDER_MANAGER,
            User.Role.ACCOUNTANT,
            User.Role.DELIVERY_MANAGER
        ])


class CustomerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        qs = User.objects.filter(role=User.Role.CUSTOMER)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search) | qs.filter(phone__icontains=search)
        return qs.order_by('-date_joined')


class CustomerStatusToggleView(APIView):
    permission_classes = [IsAdminOrStaff]

    def post(self, request, pk):
        try:
            customer = User.objects.get(pk=pk, role=User.Role.CUSTOMER)
        except User.DoesNotExist:
            return Response({"detail": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

        customer.is_active = not customer.is_active
        customer.save()
        
        AuditLog.objects.create(
            user=request.user,
            action="CUSTOMER_STATUS_TOGGLE",
            target_model="CustomUser",
            target_id=str(customer.id),
            details={"new_status": customer.is_active, "customer_email": customer.email}
        )
        return Response({
            "message": f"Customer {'activated' if customer.is_active else 'suspended'} successfully.",
            "is_active": customer.is_active
        })


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]
    queryset = AuditLog.objects.all().select_related('user')
