# InsightAI Recovered Build

This ZIP was reconstructed from the uploaded `InsightAI_MVP_Deployable(1).zip` plus code/features that were explicitly present in our conversation history.

It includes the known later additions:
- Gemini -> Groq -> OpenAI fallback
- conversation history in AI chat
- business insight generation
- AI chart JSON generation
- chat response chart support
- Recharts chart rendering in Chat
- expanded dashboard analytics endpoint
- AI dashboard insights and recommendations
- CSV/XLSX/PDF report paths retained

IMPORTANT: This is a **reconstructed continuation build**, not a byte-for-byte recovery of the missing local folder. Some later ~600-line files were discussed but their complete source was not preserved in the conversation context, so those exact unseen lines cannot be reproduced verbatim.

Before using it, make a backup of any local project you find. Do not overwrite a newer local copy blindly.

Backend:
- `backend/app/services/ai.py`
- `backend/app/api/datasets.py`
- `backend/app/api/dashboard.py`
- `backend/app/schemas/datasets.py`
- `backend/app/core/config.py`

Frontend:
- `frontend/src/pages/Chat.jsx`
- `frontend/src/pages/Dashboard.jsx`

Environment variables expected in `backend/.env`:
- `DATABASE_URL`
- `SECRET_KEY`
- `GOOGLE_API_KEY` (optional if Groq/OpenAI is configured)
- `GROQ_API_KEY` (optional)
- `OPENAI_API_KEY` (optional)
