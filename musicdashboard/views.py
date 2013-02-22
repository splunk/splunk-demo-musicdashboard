from django.contrib.auth.decorators import login_required
from appfx.decorators.render import render_to

@render_to('musicdashboard:step0.html')
@login_required
def step0(request):
    return {
        "app_name": "musicdashboard"
    }

@render_to('musicdashboard:step1.html')
@login_required
def step1(request):
    return {
        "app_name": "musicdashboard"
    }


@render_to('musicdashboard:step2.html')
@login_required
def step2(request):
    return {
        "app_name": "musicdashboard"
    }

@render_to('musicdashboard:step3.html')
@login_required
def step3(request):
    return {
        "app_name": "musicdashboard"
    }

@render_to('musicdashboard:step4.html')
@login_required
def step4(request):
    return {
        "app_name": "musicdashboard"
    }
