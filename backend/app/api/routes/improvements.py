from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from backend.app.ai.recommendations import improve_resume_bullet
from backend.app.ai.llm_client import call_llm

router = APIRouter(prefix="/improve", tags=["Resume Improvement"])

class BulletRequest(BaseModel):
    bullet: str

class BulletResponse(BaseModel):
    original: str
    improved: str
    explanation: str

@router.post("/bullet", response_model=BulletResponse)
async def improve_bullet(req: BulletRequest):
    """Transform raw bullet points into impact-focused statements with active verbs."""
    clean_bullet = req.bullet.strip()
    if not clean_bullet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bullet point cannot be empty.",
        )

    # Deterministic NLP improvement base
    nlp_result = improve_resume_bullet(clean_bullet)

    # If LLM is configured, try getting an enhanced LLM suggestion
    prompt = f"""You are an expert resume editor and ATS specialist.
Original bullet point: "{clean_bullet}"

Rewrite this bullet point to:
1. Start with a strong action verb (e.g. Engineered, Architected, Spearheaded, Implemented).
2. Clarify technical context.
3. DO NOT invent false metrics, percentages, numbers, companies, or tools not implied.
4. If a metric would help, insert a suggestion placeholder like [metric: e.g. % improvement or user count].

Respond with:
Improved: <improved bullet>
Explanation: <brief 1-2 sentence explanation why this is better>"""

    llm_output = await call_llm(prompt)
    if llm_output and "Improved:" in llm_output:
        try:
            parts = llm_output.split("Explanation:")
            improved_part = parts[0].replace("Improved:", "").strip()
            explanation_part = parts[1].strip() if len(parts) > 1 else nlp_result["explanation"]
            return BulletResponse(
                original=clean_bullet,
                improved=improved_part,
                explanation=explanation_part,
            )
        except Exception:
            pass

    return BulletResponse(
        original=nlp_result["original"],
        improved=nlp_result["improved"],
        explanation=nlp_result["explanation"],
    )
