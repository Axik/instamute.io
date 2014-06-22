
from django.views.generic import CreateView, DetailView
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import Http404

from skd_tools.mixins import ActiveTabMixin
import short_url

from .models import Room


class RoomCreateView(ActiveTabMixin, CreateView):
    model = Room
    active_tab = 'home'


class RoomDetailView(DetailView):
    model = Room

    def get_object(self):
        try:
            decoded_id = short_url.decode_url(self.kwargs.get('shorten_id'))
        except Exception:
            raise Http404()
        return get_object_or_404(self.model, **{'id': decoded_id})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        js_conf = {'addr': settings.SIGNALING_HOST}
        context['js_conf'] = js_conf
        return context


room_create = RoomCreateView.as_view()
room_detail = RoomDetailView.as_view()
