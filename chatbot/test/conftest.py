"""
Runs before any test file is collected. Sets dummy environment variables
so config.py's fail-fast validation does not block unit tests that never
touch the network.
"""

import os

os.environ.setdefault("GEMINI_API_KEY", "test-dummy-key")
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")
os.environ.setdefault("QDRANT_API_KEY", "test-dummy-key")