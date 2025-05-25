# backend/app/api/v1/endpoints/__init__.py

# Import all endpoint routers to make them available
try:
    from . import motorcycles
except ImportError as e:
    print(f"Warning: Could not import motorcycles: {e}")
    motorcycles = None

try:
    from . import maintenance
except ImportError as e:
    print(f"Warning: Could not import maintenance: {e}")
    maintenance = None

try:
    from . import parts
except ImportError as e:
    print(f"Warning: Could not import parts: {e}")
    parts = None

try:
    from . import logs
except ImportError as e:
    print(f"Warning: Could not import logs: {e}")
    logs = None

try:
    from . import webhooks
except ImportError as e:
    print(f"Warning: Could not import webhooks: {e}")
    webhooks = None

try:
    from . import dashboard
except ImportError as e:
    print(f"Warning: Could not import dashboard: {e}")
    dashboard = None

__all__ = ["motorcycles", "maintenance", "parts", "logs", "webhooks", "dashboard"]