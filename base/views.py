from django.shortcuts import render

# Create your views here.


def home(request):

    respond = {}
    return render(request, "base_home.html", respond)
