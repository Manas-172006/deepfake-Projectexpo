"""
Gemini AI Service
Generates professional forensic explanations for deepfake predictions.

SDK: google-genai  (the modern replacement for the deprecated google-generativeai)
Install: pip install google-genai

Architecture
------------
Stateless singleton — no conversation history is stored per request.
Future chatbot mode: extend with a chat() method using client.chats.create().
"""

import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Lazy SDK import ───────────────────────────────────────────────────────────
try:
    from google import genai
    from google.genai import types as genai_types
    _SDK_AVAILABLE = True
except ImportError:
    _SDK_AVAILABLE = False
    logger.warning(
        "google-genai not installed — Gemini explanations disabled. "
        "Run: pip install google-genai"
    )


# ── Prompt templates ──────────────────────────────────────────────────────────

_FAKE_PROMPT = """\
You are a forensic AI analyst specialising in deepfake detection.
A convolutional neural network has classified the submitted image as AI-GENERATED (deepfake).

Detection result:
  Verdict    : FAKE / AI-Generated
  Confidence : {confidence}%

Write a concise, professional forensic explanation (2–3 sentences) that:
1. States the image is likely AI-generated.
2. Mentions plausible technical indicators (e.g. texture inconsistencies, synthetic smoothing,
   unnatural frequency patterns, GAN artefacts) — do NOT claim to see specific pixel-level details.
3. Reads like a cybersecurity analyst's report, not a chatbot response.
4. Uses passive/analytical voice — avoid "I can see" or "I detect".

Respond with ONLY the explanation paragraph. No headers, bullets, or preamble.\
"""

_REAL_PROMPT = """\
You are a forensic AI analyst specialising in deepfake detection.
A convolutional neural network has classified the submitted image as AUTHENTIC (real photograph).

Detection result:
  Verdict    : REAL / Authentic
  Confidence : {confidence}%

Write a concise, professional forensic explanation (2–3 sentences) that:
1. States the image appears to be an authentic photograph.
2. Mentions plausible technical indicators supporting authenticity (e.g. natural noise distribution,
   consistent lighting gradients, organic texture variance).
3. Reads like a cybersecurity analyst's report, not a chatbot response.
4. Uses passive/analytical voice — avoid "I can see" or "I detect".

Respond with ONLY the explanation paragraph. No headers, bullets, or preamble.\
"""

_FALLBACK = {
    "Fake": (
        "The model's analysis indicates a high probability of AI generation. "
        "Characteristic patterns associated with synthetic media — including irregular "
        "texture gradients and atypical frequency distributions — contributed to this classification."
    ),
    "Real": (
        "The model's analysis indicates the image exhibits characteristics consistent "
        "with authentic photographic capture, including natural noise distribution and "
        "organic texture variance typical of real-world imagery."
    ),
}


# ── Service ───────────────────────────────────────────────────────────────────

class GeminiService:
    """Singleton wrapper around the google-genai client."""

    _instance = None
    _client   = None
    _model_id: str = "gemini-1.5-flash"
    _ready:    bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # ------------------------------------------------------------------
    def initialise(self, api_key: str, model_name: str = "gemini-1.5-flash") -> bool:
        """
        Configure the Gemini client. Called once at app startup.

        Parameters
        ----------
        api_key    : Google AI Studio API key
        model_name : Gemini model ID (default: gemini-1.5-flash)

        Returns True if initialisation succeeded.
        """
        if not _SDK_AVAILABLE:
            logger.warning("google-genai SDK not available — skipping Gemini init.")
            return False

        if not api_key:
            logger.warning("GEMINI_API_KEY not set — AI explanations will use static fallback.")
            return False

        try:
            self._client   = genai.Client(api_key=api_key)
            self._model_id = model_name
            self._ready    = True
            logger.info(f"✅ Gemini service initialised  model={model_name}")
            return True

        except Exception as exc:
            logger.error(f"Gemini initialisation failed: {exc}")
            self._ready = False
            return False

    # ------------------------------------------------------------------
    async def generate_explanation(
        self,
        prediction: str,
        confidence: float,
    ) -> str:
        """
        Generate a forensic explanation for a deepfake prediction.

        Runs the synchronous SDK call in a thread-pool executor so it
        never blocks FastAPI's async event loop.

        Returns a plain-text explanation string.
        Falls back to a static explanation if Gemini is unavailable or fails.
        """
        if not self._ready or self._client is None:
            logger.info("Gemini not ready — using static fallback explanation.")
            return _FALLBACK.get(prediction, _FALLBACK["Fake"])

        template = _FAKE_PROMPT if prediction == "Fake" else _REAL_PROMPT
        prompt   = template.format(confidence=round(confidence, 1))

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self._client.models.generate_content(
                    model=self._model_id,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        temperature=0.4,
                        top_p=0.85,
                        max_output_tokens=200,
                    ),
                ),
            )

            text = response.text.strip() if response.text else ""
            if not text:
                raise ValueError("Empty response from Gemini")

            logger.info("Gemini explanation generated successfully.")
            return text

        except Exception as exc:
            logger.warning(f"Gemini generation failed ({exc}) — using static fallback.")
            return _FALLBACK.get(prediction, _FALLBACK["Fake"])

    # ------------------------------------------------------------------
    @property
    def is_ready(self) -> bool:
        return self._ready


# Global singleton
gemini_service = GeminiService()
