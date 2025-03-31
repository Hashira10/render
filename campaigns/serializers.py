from rest_framework import serializers
from .models import Sender, RecipientGroup, Recipient, Message, ClickLog, CredentialLog

class SenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sender
        fields = '__all__'

class RecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ['id', 'first_name', 'last_name', 'email', 'position']

class RecipientGroupSerializer(serializers.ModelSerializer):
    recipients = RecipientSerializer(many=True)

    class Meta:
        model = RecipientGroup
        fields = ['id', 'name', 'recipients']

    def create(self, validated_data):
        recipients_data = validated_data.pop('recipients')
        group = RecipientGroup.objects.create(**validated_data)

        for recipient_data in recipients_data:
            recipient = Recipient.objects.create(**recipient_data)
            group.recipients.add(recipient)

        return group

class MessageSerializer(serializers.ModelSerializer):
    recipient_group = RecipientGroupSerializer()
    recipients = RecipientSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient_group', 'recipients', 'campaign_name', 'subject', 'body', 'link', 'sent_at', 'host']

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



