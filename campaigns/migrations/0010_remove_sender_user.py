# Generated by Django 5.1.3 on 2025-05-21 11:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0009_sender_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sender',
            name='user',
        ),
    ]
