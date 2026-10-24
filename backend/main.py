import sys
from pathlib import Path

# Ensure backend directory is in sys.path for both local and serverless execution
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

__all__ = ["app"]
