# backend/
# ├── app/
# │   ├── __init__.py
# │   ├── main.py
# │   ├── core/
# │   │   ├── __init__.py
# │   │   ├── config.py
# │   │   ├── database.py
# │   │   └── security.py
# │   ├── models/
# │   │   ├── __init__.py
# │   │   ├── motorcycle.py
# │   │   ├── maintenance.py
# │   │   ├── parts.py
# │   │   ├── logs.py
# │   │   └── webhook.py
# │   ├── schemas/
# │   │   ├── __init__.py
# │   │   ├── motorcycle.py
# │   │   ├── maintenance.py
# │   │   ├── parts.py
# │   │   ├── logs.py
# │   │   └── webhook.py
# │   ├── api/
# │   │   ├── __init__.py
# │   │   ├── deps.py
# │   │   └── v1/
# │   │       ├── __init__.py
# │   │       ├── api.py
# │   │       ├── endpoints/
# │   │       │   ├── __init__.py
# │   │       │   ├── motorcycles.py
# │   │       │   ├── maintenance.py
# │   │       │   ├── parts.py
# │   │       │   ├── logs.py
# │   │       │   └── webhooks.py
# │   ├── services/
# │   │   ├── __init__.py
# │   │   ├── motorcycle_service.py
# │   │   ├── maintenance_service.py
# │   │   ├── webhook_service.py
# │   │   └── notification_service.py
# │   └── utils/
# │       ├── __init__.py
# │       ├── helpers.py
# │       └── constants.py
# ├── requirements.txt
# ├── Dockerfile
# └── docker-compose.yml