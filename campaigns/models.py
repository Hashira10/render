from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User

class Sender(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='senders')
    smtp_host = models.CharField(max_length=255)
    smtp_port = models.IntegerField()
    smtp_username = models.CharField(max_length=255)
    smtp_password = models.CharField(max_length=255)

    def __str__(self):
        return self.smtp_username

class RecipientGroup(models.Model):
    name = models.CharField(max_length=255)
    recipients = models.ManyToManyField('Recipient')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipient_groups')

    def __str__(self):
        return self.name

class Recipient(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipients')
    first_name = models.CharField(max_length=100, default="unknown", blank=True, null=True)
    last_name = models.CharField(max_length=100, default="unknown", blank=True, null=True)
    email = models.EmailField()
    position = models.CharField(max_length=100, default="unknown", blank=True, null=True)

    def __str__(self):
        return f"{self.first_name or 'Unknown'} {self.last_name or 'Unknown'}"


class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Sender, on_delete=models.CASCADE)
    recipient_group = models.ForeignKey(RecipientGroup, on_delete=models.CASCADE)
    recipients = models.ManyToManyField(Recipient, blank=True) 
    campaign_name = models.CharField(max_length=255, default="Unnamed Campaign")
    subject = models.CharField(max_length=255)
    body = models.TextField()
    link = models.URLField(blank=True, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    host = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"Campaign: {self.campaign_name} - {self.subject}"



class ClickLog(models.Model):
    
    recipient = models.ForeignKey("Recipient", on_delete=models.CASCADE, null=True, blank=True)
    message = models.ForeignKey("Message", on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=now)
    platform = models.CharField(max_length=50, default="unknown")


    def __str__(self):
        return f"Click from {self.ip_address} for {self.message.campaign_name} at {self.timestamp}"


class CredentialLog(models.Model):
    
    recipient = models.ForeignKey("Recipient", on_delete=models.CASCADE, null=True, blank=True)
    message = models.ForeignKey("Message", on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    password = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=now)
    platform = models.CharField(max_length=50, default="unknown")

    def __str__(self):
        return f"Login attempt for {self.email} at {self.timestamp}"
