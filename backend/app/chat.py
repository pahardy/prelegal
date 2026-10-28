"""AI chat that gathers Mutual NDA terms through conversation."""

from datetime import date
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from litellm import completion
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You help a user draft a Mutual Non-Disclosure Agreement through friendly conversation.
Today is {today}. Gather these terms, asking about one or two at a time:
- purpose: why the parties are sharing confidential information (it starts as a generic placeholder, so ask for the real one)
- effectiveDate: ISO format YYYY-MM-DD
- MNDA term: a number of years, or continues until terminated
- confidentiality term: a number of years, or in perpetuity
- governingLaw: a US state
- jurisdiction: e.g. "courts located in New Castle, DE"
- modifications: optional changes to the standard terms
Current values: {values}
In `updates`, set only the fields the user just told you about and leave all others null.
Keep replies short. When the required terms are known, confirm them and tell the user they can download the NDA."""


class NdaValues(BaseModel):
    """Current Mutual NDA terms. Years of None mean open-ended."""

    purpose: str = "Evaluating whether to enter into a business relationship with the other party."
    effectiveDate: str = ""
    mndaTermYears: int | None = 1
    confidentialityYears: int | None = 1
    governingLaw: str = ""
    jurisdiction: str = ""
    modifications: str = ""


class NdaUpdates(BaseModel):
    """Terms learned in the latest user message; null means unchanged."""

    purpose: str | None
    effectiveDate: date | None
    mndaTermYears: int | None
    mndaUntilTerminated: bool | None
    confidentialityYears: int | None
    confidentialityPerpetual: bool | None
    governingLaw: str | None
    jurisdiction: str | None
    modifications: str | None


class AiTurn(BaseModel):
    """Structured output from the model."""

    reply: str
    updates: NdaUpdates


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    values: NdaValues


class ChatResponse(BaseModel):
    reply: str
    values: NdaValues


def merge(values: NdaValues, updates: NdaUpdates) -> NdaValues:
    """Apply the non-null updates to the current values."""
    changes = updates.model_dump(mode="json", exclude_none=True)
    if changes.pop("mndaUntilTerminated", False):
        changes["mndaTermYears"] = None
    if changes.pop("confidentialityPerpetual", False):
        changes["confidentialityYears"] = None
    return values.model_copy(update=changes)


def chat(request: ChatRequest) -> ChatResponse:
    """Ask the model for the next reply and fold its updates into the values."""
    system = SYSTEM_PROMPT.format(today=date.today().isoformat(), values=request.values.model_dump_json())
    messages = [{"role": "system", "content": system}, *[m.model_dump() for m in request.messages]]
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=AiTurn,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    turn = AiTurn.model_validate_json(response.choices[0].message.content)
    return ChatResponse(reply=turn.reply, values=merge(request.values, turn.updates))
