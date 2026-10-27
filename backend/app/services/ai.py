import json
import re
from litellm import completion
from app.core.config import settings
from app.models import Dataset
from sqlalchemy import text
from sqlalchemy.orm import Session

BLOCKED = re.compile(r"\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|execute|merge)\b", re.I)

def get_ai_providers():
    providers=[]
    if settings.google_api_key: providers.append({"name":"Gemini","model":settings.llm_model,"api_key":settings.google_api_key})
    if settings.groq_api_key: providers.append({"name":"Groq","model": "groq/openai/gpt-oss-120b","api_key":settings.groq_api_key})
    if settings.openai_api_key: providers.append({"name":"OpenAI","model":"openai/gpt-4o-mini","api_key":settings.openai_api_key})
    return providers

def llm(prompt: str) -> str:
    providers=get_ai_providers()
    if not providers: raise RuntimeError("No AI provider is configured. Configure Gemini, Groq, or OpenAI.")
    errors=[]
    for provider in providers:
        try:
            print(f"[InsightAI] Trying {provider['name']}...")
            result=completion(model=provider["model"],api_key=provider["api_key"],messages=[{"role":"user","content":prompt}],temperature=0)
            answer=result.choices[0].message.content
            print(f"[InsightAI] {provider['name']} succeeded.")
            return answer.strip()
        except Exception as e:
            error_text=str(e)
            print(f"[InsightAI] {provider['name']} failed: {error_text[:300]}")
            errors.append(f"{provider['name']}: {error_text}")
    raise RuntimeError(
    "All configured AI providers are temporarily unavailable. "
    "Please try again in a moment."
)

def clean_sql(s: str) -> str:
    s=s.replace('```sql','').replace('```','').strip()
    if ';' in s: s=s.split(';',1)[0]
    return s

def _history_text(history):
    if not history: return "No previous conversation."
    lines=[]
    for item in history[-10:]:
        role=item.get("role","user")
        value=item.get("text",item.get("content",""))
        if value: lines.append(f"{role}: {value}")
    return "\n".join(lines) or "No previous conversation."

def generate_sql(question: str, datasets: list[Dataset], history=None) -> str:
    schema=[]
    for d in datasets:
        schema.append({"table":d.table_name,"display_name":d.name,"columns":json.loads(d.schema_json)})
    prompt=f'''You are a PostgreSQL analytics assistant. Generate exactly one read-only SELECT statement for the user's question.

Allowed tables and schemas:
{json.dumps(schema,indent=2)}

Previous conversation:
{_history_text(history)}

Rules:
- Use only the listed tables.
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, COPY, CALL, EXECUTE, MERGE.
- Never access information_schema, pg_catalog, or any table not listed.
- Return SQL only.
- Prefer aggregations for business questions.
- Add LIMIT 100 unless the query is a single aggregate.
- Resolve follow-up questions using the previous conversation when useful.
User question: {question}'''
    return clean_sql(llm(prompt))

def validate_sql(sql: str, datasets: list[Dataset]):
    if not sql.lower().startswith('select'): raise ValueError('Only SELECT queries are allowed.')
    if BLOCKED.search(sql): raise ValueError('Unsafe SQL was blocked.')
    lowered=sql.lower()
    if 'information_schema' in lowered or 'pg_catalog' in lowered: raise ValueError('System catalog access was blocked.')
    allowed={d.table_name.lower() for d in datasets}
    refs=re.findall(r'\b(?:from|join)\s+["`]?([a-zA-Z0-9_]+)',lowered)
    if not refs or any(r not in allowed for r in refs): raise ValueError('The generated query referenced a table outside your datasets.')

def run_question(db: Session, question: str, datasets: list[Dataset], history=None):
    sql=generate_sql(question,datasets,history); validate_sql(sql,datasets)
    result=db.execute(text(sql)); rows=[list(r) for r in result.fetchmany(100)]; cols=list(result.keys())
    return sql,cols,rows

def summarize(question: str, columns: list[str], rows: list[list], history=None) -> str:
    if not rows: return 'No matching data was found for that question.'
    prompt=f'''Explain this business analytics result in clear language for a shop owner. Do not invent facts.
Question: {question}
Previous conversation: {_history_text(history)}
Columns: {columns}
Rows: {rows[:20]}
Give a concise answer, mention the key number(s), and add one practical observation when the data supports it.'''
    return llm(prompt)

def generate_business_insights(analytics: dict) -> dict:
    prompt=f'''You are an expert business intelligence analyst.

Analyze the following VERIFIED analytics from a business dataset.

Analytics:
{json.dumps(analytics,indent=2,default=str)}

IMPORTANT RULES:
- Use ONLY the information provided.
- Never invent numbers, products, customers, dates, or trends.
- Do not make claims that the data does not support.
- Keep the language simple and professional.
- Recommendations must be based on the available data.
- If something cannot be determined from the data, say so.
- Return valid JSON only.
- Do not use markdown.

Return exactly this structure:
{{
"summary":"A short overall business summary.",
"key_insights":["Insight 1","Insight 2","Insight 3"],
"recommendations":["Recommendation 1","Recommendation 2","Recommendation 3"],
"opportunities":["Opportunity 1","Opportunity 2"],
"risks":["Risk 1","Risk 2"]
}}'''
    result=llm(prompt)
    try: return json.loads(result)
    except json.JSONDecodeError: return json.loads(result.replace('```json','').replace('```','').strip())

def build_chart(columns, rows):
    if len(columns)<2 or not rows: return None
    x_key,y_key=columns[0],columns[1]; chart_data=[]
    for row in rows[:20]:
        try: chart_data.append({x_key:str(row[0]),y_key:float(row[1])})
        except (TypeError,ValueError): return None
    chart_type='bar'
    if 'date' in x_key.lower() or 'time' in x_key.lower(): chart_type='line'
    elif len(chart_data)<=6: chart_type='pie'
    return {'type':chart_type,'x':x_key,'y':y_key,'data':chart_data}
