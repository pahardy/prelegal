"""AI chat that gathers the terms of any supported legal document through conversation."""

from datetime import date
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from litellm import completion
from pydantic import BaseModel, Field

from app import templates

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

BASE_PROMPT = """You help a user draft legal agreements through friendly conversation. Today is {today}.
Supported documents (id: name - description):
{catalog}
If the user asks for a document we do not support, say we cannot generate it, then name the single closest supported document by name and ask whether they would like to create that instead. Never invent other documents.
Set `document` to a supported id once the user has chosen one (leave it null otherwise, or if unchanged).
In update fields, set only what the user explicitly stated and leave everything else null or empty. Never guess or assume a value, including dates and which party is which role; ask instead.
Keep replies short and ask about one to three items at a time. When the needed terms are known, confirm them and tell the user they can download the document."""

NO_DOCUMENT_PROMPT = "No document is chosen yet. Greet the user, ask what they need, and help them choose."

NDA_PROMPT = """The chosen document is the Mutual NDA. Gather these in `ndaUpdates`:
- purpose: why the parties are sharing confidential information (it starts as a generic placeholder, so ask for the real one)
- effectiveDate: ISO format YYYY-MM-DD
- MNDA term: a number of years, or continues until terminated
- confidentiality term: a number of years, or in perpetuity
- governingLaw: a US state
- jurisdiction: e.g. "courts located in New Castle, DE"
- modifications: optional changes to the standard terms
Current values: {values}"""

TERMS_PROMPT = """The chosen document is the {name}. Gather values for its key terms in `termUpdates` as {{term, value}} pairs.
Explain each term in plain language when asking. Values are inserted into sentences of the document, so phrase each to read naturally in place of the term (for example Governing Law: "laws of the State of Delaware", because the document says "The Governing Law will govern"); do not start a value with an article. Skip terms that the document itself defines (for example "Agreement") and
terms with obvious defaults you can propose and confirm. Party terms such as Customer, Provider, Company or Partner take the party's name. The Provider supplies the product or service and the Customer receives it; if the user has not said which party is which, leave both blank and ask.
Every value you confirm or mention in `reply` must also appear in `termUpdates`, or it is lost.
Key terms and current values (blank means not yet set):
{terms}"""


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


class TermUpdate(BaseModel):
    term: str
    value: str


class AiTurn(BaseModel):
    """Structured output from the model."""

    reply: str
    document: str | None
    ndaUpdates: NdaUpdates
    termUpdates: list[TermUpdate]


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    documentId: int | None = None
    document: str | None = None
    ndaValues: NdaValues = Field(default_factory=NdaValues)
    terms: dict[str, str] = {}


class ChatResponse(BaseModel):
    reply: str
    documentId: int | None = None
    document: str | None
    ndaValues: NdaValues
    terms: dict[str, str]


def merge(values: NdaValues, updates: NdaUpdates) -> NdaValues:
    """Apply the non-null updates to the current values."""
    changes = updates.model_dump(mode="json", exclude_none=True)
    if changes.pop("mndaUntilTerminated", False):
        changes["mndaTermYears"] = None
    if changes.pop("confidentialityPerpetual", False):
        changes["confidentialityYears"] = None
    return values.model_copy(update=changes)


def build_system_prompt(document: str | None, nda: NdaValues, terms: dict[str, str]) -> str:
    """Compose the system prompt for the current document state."""
    docs = templates.catalog()
    catalog = "\n".join(f"{i}: {d['name']} - {d['description']}" for i, d in docs.items())
    prompt = BASE_PROMPT.format(today=date.today().isoformat(), catalog=catalog)
    if document is None:
        return f"{prompt}\n{NO_DOCUMENT_PROMPT}"
    if document == templates.NDA_ID:
        return f"{prompt}\n{NDA_PROMPT.format(values=nda.model_dump_json())}"
    listing = "\n".join(f"- {t}: {terms.get(t, '')}" for t in templates.load(document)["terms"])
    return f"{prompt}\n{TERMS_PROMPT.format(name=docs[document]['name'], terms=listing)}"


def ask(messages: list[Message], document: str | None, nda: NdaValues, terms: dict[str, str]) -> AiTurn:
    """Call the model once with the prompt for the current document state."""
    system = build_system_prompt(document, nda, terms)
    payload = [{"role": "system", "content": system}, *[m.model_dump() for m in messages]]
    response = completion(
        model=MODEL,
        messages=payload,
        response_format=AiTurn,
        reasoning_effort="medium",
        extra_body=EXTRA_BODY,
    )
    return AiTurn.model_validate_json(response.choices[0].message.content)


def chat(request: ChatRequest) -> ChatResponse:
    """Get the next reply and fold its updates into the document state.

    When the model chooses a new document, the state is reset and the model is asked again so
    that its answer is based on that document's key terms.
    """
    document, nda, terms = request.document, request.ndaValues, request.terms
    turn = ask(request.messages, document, nda, terms)
    if turn.document in templates.catalog() and turn.document != document:
        document, nda, terms = turn.document, NdaValues(), {}
        turn = ask(request.messages, document, nda, terms)
    nda = merge(nda, turn.ndaUpdates)
    if document:
        valid = templates.load(document)["terms"]
        terms = {**terms, **{u.term: u.value for u in turn.termUpdates if u.term in valid and u.value}}
    return ChatResponse(reply=turn.reply, document=document, ndaValues=nda, terms=terms)
