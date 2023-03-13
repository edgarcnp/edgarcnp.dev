import requests
from django.shortcuts import render

# Create your views here.


def home(request):
    response = requests.get("https://api.ipify.org?format=json")
    user_ip_address = response.json()["ip"]

    respond = {"user_ip_address": user_ip_address}
    return render(request, "base_home.html", respond)
