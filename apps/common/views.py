from django.views.generic import RedirectView, FormView
from django.core.urlresolvers import reverse_lazy
from django.conf import settings
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _

from skd_tools.mixins import ActiveTabMixin

from .forms import ContactForm
from .tasks import queued_send_mail


class MainView(RedirectView):
    url = reverse_lazy('rooms:create')


class ContactView(ActiveTabMixin, FormView):
    form_class = ContactForm
    template_name = 'contact.html'
    success_url = reverse_lazy('rooms:create')
    active_tab = 'contact'

    def form_valid(self, form):
        queued_send_mail.delay(subject='Feedback from {}'.format(form.cleaned_data['email']),
                               body=form.data['body'], to=[m for k, m in settings.ADMINS])
        messages.success(self.request, _('Thank you for your feedback, summoner! It\'s very important for ours team'))
        return super().form_valid(form)


main = MainView.as_view()
contact = ContactView.as_view()
