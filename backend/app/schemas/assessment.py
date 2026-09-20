"""
Pydantic schemas for the skill assessment feature.
"""

from pydantic import BaseModel
from typing import List , Dict


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
    


class AssessmentSubmit(BaseModel):
    """
    Shape of the data sent when a user submits their answers for a
    skill assessment. `answers` maps each question's id to the
    option text the user selected — e.g. {1: "def", 2: "<class 'list'>"}.
    """
    skill_name: str
    answers: Dict[int, str]


class AssessmentResult(BaseModel):
    """
    Shape of the response after scoring — tells the frontend how
    the user did, without exposing which specific answers were
    right or wrong in detail (avoids letting someone retry with
    answer-by-answer feedback to guess their way to a perfect score).
    """
    skill_name: str
    score: int
    correct_count: int
    total_questions: int