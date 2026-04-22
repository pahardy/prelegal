import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from litellm import completion

router = APIRouter()

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal assistant helping users create a Mutual Non-Disclosure Agreement (MNDA).

Your goal is to gather the following fields through natural conversation:
- purpose: how confidential information may be used between the parties
- effectiveDate: when the agreement starts (format: YYYY-MM-DD)
- mndaTermType: "expires" (after N years) or "continuous" (until terminated by either party)
- mndaTermYears: if "expires", how many years (integer, 1-10)
- confidentialityTermType: "years" (protected for N years) or "perpetuity" (protected forever)
- confidentialityTermYears: if "years", how many (integer, 1-10)
- governingLaw: US state governing this agreement (e.g., "California")
- jurisdiction: courts where disputes are resolved (e.g., "courts located in San Francisco, CA")
- party1Company: first party company name
- party1Name: first party signatory full name
- party1Title: first party title (optional, may be empty string)
- party1Address: first party notice address (email or postal)
- party2Company: second party company name
- party2Name: second party signatory full name
- party2Title: second party title (optional, may be empty string)
- party2Address: second party notice address (email or postal)

Guidelines:
- Start by greeting the user and asking about the purpose of the NDA
- Ask 1-2 related questions at a time, not all at once
- Be warm, concise, and professional
- When all required fields are filled, tell the user the document is complete and ready to download
- Today's date is 2026-04-22

Always respond with a JSON object:
{
  "message": "<your conversational reply>",
  "fields": {
    "purpose": null or string,
    "effectiveDate": null or "YYYY-MM-DD",
    "mndaTermType": null or "expires" or "continuous",
    "mndaTermYears": null or integer,
    "confidentialityTermType": null or "years" or "perpetuity",
    "confidentialityTermYears": null or integer,
    "governingLaw": null or string,
    "jurisdiction": null or string,
    "party1Company": null or string,
    "party1Name": null or string,
    "party1Title": null or string,
    "party1Address": null or string,
    "party2Company": null or string,
    "party2Name": null or string,
    "party2Title": null or string,
    "party2Address": null or string
  }
}
"""


class NdaFields(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[str] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[str] = None
    confidentialityTermYears: Optional[int] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    party1Company: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Address: Optional[str] = None
    party2Company: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Address: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    fields: NdaFields


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

    response = completion(
        model=MODEL,
        messages=messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=os.environ["OPENROUTER_API_KEY"],
        api_base="https://openrouter.ai/api/v1",
    )
    result = response.choices[0].message.content
    return ChatResponse.model_validate_json(result)
