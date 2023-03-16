from django.shortcuts import render

# Create your views here.


def home(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        user_ip_address = x_forwarded_for.split(",")[0]
    else:
        user_ip_address = request.META.get("REMOTE_ADDR")

    respond = {"user_ip_address": user_ip_address}
    return render(request, "base_home.html", respond)
