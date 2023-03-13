from django.core.mail import send_mail
from django.http import HttpResponse


def send_contact_email(request):
    if not request.POST:
        return HttpResponse(status=400)

    name = request.POST.get("name")
    email = request.POST.get("email")
    comments = request.POST.get("comments")

    e_subject = f"You have been contacted by {name}."
    e_body = (
        f"Hi {name},\n\n"
        "Thank you for contacting us. We have received your message and will "
        "get back to you as soon as possible.\n\n"
        "Below is a copy of your message for your records:\n\n"
        f"{comments}\n\n"
        "Best regards,\n"
        "The Support Team\n"
        "OurCompany\n"
    )

    send_mail(
        e_subject,
        e_body,
        "support@ourcompany.com",
        [email],
        fail_silently=False,
    )

    # return HttpResponse('<div class="success_msg">
