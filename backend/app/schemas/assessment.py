"""
Pydantic schemas for the skill assessment feature.
"""

from pydantic import BaseModel
from typing import List


class QuestionResponse(BaseModel):
    """
    Shape of a single question sent to the frontend.

    Deliberately excludes `correct_answer` — the frontend should
    never receive the answer key, since a user could just read it
    directly in their browser's network tab and defeat the whole
    point of the assessment. Scoring happens entirely on the
    backend, using the real correct_answer values that never leave
    the server.
    """
    id: int
    question_text: str
    options: List[str]
    difficulty: str


class QuestionsListResponse(BaseModel):
    """
    Shape of the full response for GET /assessment/questions/{skill} —
    the skill's name plus its list of questions.
    """
    skill_name: str
    questions: List[QuestionResponse]