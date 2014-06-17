from django.conf import settings
from django.conf.urls import patterns, include, url

urlpatterns = patterns(
    'common.views',
    url(r'^rooms/', include('rooms.urls', 'rooms')),
    url(r'^profile/', include('profiles.urls', 'profiles')),
    url(r'^contact/', 'contact', name='contact'),
    url(r'^about/', 'about', name='about'),
    url(r'^$', 'main', name='main'),
)

urlpatterns += patterns(
    'django.views.static',
    url(r'^static/(.*)$', 'serve', {'document_root': settings.STATIC_ROOT}),
    url(r'^media/(.*)$', 'serve', {'document_root': settings.MEDIA_ROOT}))
