from django.conf.urls import patterns, include, url
from appfx.utility.views import render_template as render

urlpatterns = patterns('',
    url(r'^home/$', 'musicdashboard.views.home', name='home'), 
    url(r'^step0/$', 'musicdashboard.views.step0', name='step0'), 
    url(r'^step1/$', 'musicdashboard.views.step1', name='step1'), 
    url(r'^step2/$', 'musicdashboard.views.step2', name='step2'), 
    url(r'^step3/$', 'musicdashboard.views.step3', name='step3'), 
    url(r'^step4/$', 'musicdashboard.views.step4', name='step4'), 
)
