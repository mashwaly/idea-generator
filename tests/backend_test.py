import pytest
from httpx import AsyncClient
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.server import app

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(app=app, base_url="http://localhost:55947") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}

# Since the backend is minimal at this point, we only have the root endpoint to test
# More tests will be added as backend functionality grows