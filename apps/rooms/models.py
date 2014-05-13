from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse_lazy


import short_url
from model_utils.models import TimeStampedModel


class Room(TimeStampedModel):

    people_in = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')

    def __str__(self):
        pass

    def get_absolute_url(self):
        return reverse_lazy('rooms:detail', kwargs={'shorten_id': self.shorten_url})

    @property
    def shorten_url(self):
        return short_url.encode_url(self.id)
