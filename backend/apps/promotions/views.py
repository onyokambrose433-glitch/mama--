from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAdminOrStaff
from .models import Coupon
from .serializers import CouponSerializer, CouponValidateSerializer

class CouponValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].strip().upper()
        subtotal = serializer.validated_data['subtotal']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({"valid": False, "message": "Invalid coupon code.", "discount": 0}, status=status.HTTP_400_BAD_REQUEST)

        discount, msg = coupon.calculate_discount(subtotal)
        if discount == 0 and msg != "Applied":
            return Response({"valid": False, "message": msg, "discount": 0}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "valid": True,
            "message": "Coupon applied successfully!",
            "coupon_code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": float(coupon.discount_value),
            "discount": float(discount)
        })


class AdminCouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    pagination_class = None
    permission_classes = [IsAdminOrStaff]
    queryset = Coupon.objects.all()
