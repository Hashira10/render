from rest_framework import serializers
from .models import Sender, RecipientGroup, Recipient, Message, ClickLog, CredentialLog

class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sender
        fields = ['id', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password']


class RecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ['id', 'first_name', 'last_name', 'email', 'position']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'position': {'required': False},
        }

class RecipientGroupSerializer(serializers.ModelSerializer):
    recipients = RecipientSerializer(many=True)

    class Meta:
        model = RecipientGroup
        fields = ['id', 'name', 'recipients']

    def create(self, validated_data):
        recipients_data = validated_data.pop('recipients', [])
        user = validated_data.pop('user', None)
        group = RecipientGroup.objects.create(user=user, **validated_data)

        for recipient_data in recipients_data:
            recipient = Recipient.objects.create(
                user=user,
                email=recipient_data['email'],
                first_name=recipient_data.get('first_name', None),
                last_name=recipient_data.get('last_name', None),
                position=recipient_data.get('position', None),
            )
            group.recipients.add(recipient)

        return group



class MessageSerializer(serializers.ModelSerializer):
    recipient_group = RecipientGroupSerializer()
    recipients = RecipientSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'user', 'sender', 'recipient_group', 'recipients', 'campaign_name', 'subject', 'body', 'link', 'sent_at', 'host']
        read_only_fields = ['user', 'sent_at', 'recipients']

    def to_representation(self, instance):
        """
        Переопределяем вывод данных, добавляя `recipients`, 
        даже если оно не сохраняется в модели напрямую.
        """
        data = super().to_representation(instance)
        data['recipients'] = RecipientSerializer(instance.recipient_group.recipients.all(), many=True).data
        return data



class ClickLogSerializer(serializers.ModelSerializer):
    recipient = RecipientSerializer() 

    class Meta:
        model = ClickLog
        fields = '__all__'

class CredentialLogSerializer(serializers.ModelSerializer):
    recipient = RecipientSerializer() 

    class Meta:
        model = CredentialLog
        fields = '__all__'



