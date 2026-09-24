"""
Pydantic schemas for the AI career chat feature.
"""

from pydantic import BaseModel
from typing import List
from datetime import datetime


class ChatSessionOut(BaseModel):
    id: int
    profile_id: str
    created_at: datetime


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class SendMessageRequest(BaseModel):
    content: str


class SendMessageResponse(BaseModel):
    user_message: ChatMessageOut
    assistant_message: ChatMessageOut