from rest_framework import serializers
from .models import WebsiteSettings, HomepageBanner

class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = '__all__'


class HomepageBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageBanner
        fields = '__all__'
