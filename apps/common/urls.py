from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns(
    'common.views',
    url(r'^admin/', include(admin.site.urls)),
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
