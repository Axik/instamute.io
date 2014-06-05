import logging

from django.views.generic import RedirectView, FormView, TemplateView
from django.core.urlresolvers import reverse_lazy
from django.conf import settings
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _
from django.core.mail import EmailMessage


from skd_tools.mixins import ActiveTabMixin

from .forms import ContactForm

logger = logging.getLogger(__package__)


class MainView(RedirectView):
    url = reverse_lazy('rooms:create')


class ContactView(ActiveTabMixin, FormView):
    form_class = ContactForm
    template_name = 'contact.html'
    success_url = reverse_lazy('rooms:create')
    active_tab = 'contact'

    def form_valid(self, form):
        from_email = settings.EMAIL_FROM_ADDRESS
        message = EmailMessage(subject='Feedback from {}'.format(form.cleaned_data['email']),
                               body=form.data['body'], to=[m for k, m in settings.ADMINS], from_email=from_email)
        message.content_subtype = 'html'
        try:
            message.send(fail_silently=True)
        except Exception:
            msg = 'Email server connection error'
            logger.exception(msg)

        messages.success(self.request, _('Thank you for your feedback, summoner! It\'s very important for ours team'))
        return super().form_valid(form)


class AboutView(ActiveTabMixin, TemplateView):
    template_name = 'about.html'
    active_tab = 'about'


main = MainView.as_view()
contact = ContactView.as_view()
about = AboutView.as_view()
