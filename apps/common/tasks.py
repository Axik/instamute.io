import logging

from django.core.mail import EmailMessage
from django.conf import settings
from django_rq import job

logger = logging.getLogger(__package__)


@job
def queued_send_mail(subject, body, to,
                     fail_silently=False,
                     auth_user=None,
                     auth_password=None,
                     connection=None):
    from_email = settings.EMAIL_FROM_ADDRESS
    message = EmailMessage(subject, body, from_email, to)
    message.content_subtype = 'html'
    try:
        message.send(fail_silently=True)
    except Exception:
        msg = 'Email server connection error'
        logger.exception(msg)
