# InsightAI

AI Business Intelligence SaaS MVP for retail and medical-store style businesses.

## What it does
- Secure company/user authentication with JWT
- Upload CSV/XLSX/PDF table data
- Import each dataset into a tenant-scoped PostgreSQL table
- Dashboard KPIs and dataset overview
- Natural-language questions translated to read-only SQL by Gemini
- AI-generated business insights
- CSV/XLSX downloads
- PDF business report generation
- Docker Compose deployment

## Local development

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment
Copy `.env.example` to `.env` and set `DATABASE_URL`, `SECRET_KEY`, and `GOOGLE_API_KEY`.

For local PostgreSQL you can use `postgresql+psycopg://user:password@localhost:5432/insightai`.

## Docker
```bash
docker compose up --build
```
Frontend: http://localhost:5173
Backend API: http://localhost:8000
Swagger: http://localhost:8000/docs

## Production notes
- Use a managed PostgreSQL service (Neon, Supabase, RDS, etc.).
- Use HTTPS.
- Set a strong `SECRET_KEY` and never commit `.env`.
- For production, create a separate PostgreSQL read-only role for AI-generated SQL execution.
- Put the frontend behind a CDN/static host and the API behind a managed container service.
- Rotate any API keys that were ever stored in a local `.env` and shared/uploaded.

## Suggested first deployment

For the first live demo, use Docker Compose on a small VPS, or deploy the backend/frontend containers separately and use managed PostgreSQL.

Required production variables:
- DATABASE_URL
- SECRET_KEY
- FRONTEND_ORIGIN
- VITE_API_URL
- GOOGLE_API_KEY

Do not upload your `.env` file to GitHub.
