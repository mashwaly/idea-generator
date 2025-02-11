import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
import sys
import os

# Mock MongoDB before importing app
with patch('motor.motor_asyncio.AsyncIOMotorClient'):
    from server import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

# Note: Since most functionality is client-side with OpenAI API,
# we have limited backend tests. The main testing will be done through UI testing.