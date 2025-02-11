import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

# Mock MongoDB before importing app
with patch('motor.motor_asyncio.AsyncIOMotorClient'):
    from server import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

# Note: Most functionality is client-side with OpenAI API.
# The backend mainly serves as a lightweight API layer.
# Main testing will focus on UI and OpenAI API integration.