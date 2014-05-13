from django.views.generic import CreateView, DetailView
from django.shortcuts import get_object_or_404

import short_url

from .models import Room


class RoomCreateView(CreateView):
    model = Room


class RoomDetailView(DetailView):
    model = Room

    def get_object(self):
        decoded_id = short_url.decode_url(self.kwargs.get('shorten_id'))
        return get_object_or_404(self.model, **{'id': decoded_id})

room_create = RoomCreateView.as_view()
room_detail = RoomDetailView.as_view()
