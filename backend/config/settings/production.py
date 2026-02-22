"""
Production settings for 7-Seas Suites project.
"""

from decouple import config
from .base import *

DEBUG = False

# Security settings for production
# Set SECURE_SSL=True in .env.prod once SSL/HTTPS is configured
_ssl_enabled = config('SECURE_SSL', default=False, cast=bool)
SECURE_SSL_REDIRECT = _ssl_enabled
SESSION_COOKIE_SECURE = _ssl_enabled
CSRF_COOKIE_SECURE = _ssl_enabled
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if _ssl_enabled else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = _ssl_enabled
SECURE_HSTS_PRELOAD = _ssl_enabled

# Production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'WARNING',
    },
}
