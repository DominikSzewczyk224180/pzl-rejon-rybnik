"""
PZŁ Rejon Rybnicki — Backend API
FastAPI + PostgreSQL (Railway)
"""
import os
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional, List

import asyncpg
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from jose import jwt, JWTError

# -----------------------------------------------------------
# CONFIG (set in Railway environment variables)
# -----------------------------------------------------------
DATABASE_URL    = os.getenv("DATABASE_URL", "")
SECRET_KEY      = os.getenv("SECRET_KEY", secrets.token_hex(32))
ADMIN_PASSWORD  = os.getenv("ADMIN_PASSWORD", "zmienmnieprosze")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
ALGORITHM       = "HS256"
TOKEN_HOURS     = 24

# Railway provides DATABASE_URL with postgres:// — asyncpg needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# -----------------------------------------------------------
# APP & DB POOL
# -----------------------------------------------------------
db_pool: Optional[asyncpg.Pool] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL not set")
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS news (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                short_description TEXT,
                image_base64 TEXT,
                event_date TIMESTAMPTZ,
                location TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
    yield
    await db_pool.close()

app = FastAPI(title="PZŁ Rejon Rybnicki API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login", auto_error=True)

# -----------------------------------------------------------
# MODELS
# -----------------------------------------------------------
class LoginRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class NewsBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1)
    short_description: Optional[str] = Field(None, max_length=500)
    image_base64: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=300)

class NewsCreate(NewsBase):
    pass

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_base64: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None

class News(NewsBase):
    id: int
    created_at: datetime

# -----------------------------------------------------------
# AUTH
# -----------------------------------------------------------
def create_token() -> str:
    payload = {
        "sub": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def require_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

# -----------------------------------------------------------
# ENDPOINTS
# -----------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "service": "PZŁ Rejon Rybnicki API"}

@app.post("/admin/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    if not secrets.compare_digest(req.password, ADMIN_PASSWORD):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Niepoprawne hasło")
    return TokenResponse(access_token=create_token())

@app.get("/news", response_model=List[News])
async def list_news(limit: int = 20):
    async with db_pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM news ORDER BY COALESCE(event_date, created_at) DESC LIMIT $1",
            min(max(1, limit), 100)
        )
        return [dict(r) for r in rows]

@app.get("/news/upcoming")
async def upcoming_event():
    """Returns the next future event (event_date >= now), or null."""
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM news WHERE event_date IS NOT NULL AND event_date >= NOW() "
            "ORDER BY event_date ASC LIMIT 1"
        )
        return dict(row) if row else None

@app.get("/news/{news_id}", response_model=News)
async def get_news(news_id: int):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM news WHERE id=$1", news_id)
        if not row:
            raise HTTPException(404, "Nie znaleziono")
        return dict(row)

@app.post("/news", response_model=News, dependencies=[Depends(require_admin)])
async def create_news(news: NewsCreate):
    # Limit image size to ~5MB base64
    if news.image_base64 and len(news.image_base64) > 7_000_000:
        raise HTTPException(413, "Obraz zbyt duży (max ok. 5 MB)")
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO news (title, description, short_description, image_base64, event_date, location)
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING *""",
            news.title, news.description, news.short_description,
            news.image_base64, news.event_date, news.location
        )
        return dict(row)

@app.put("/news/{news_id}", response_model=News, dependencies=[Depends(require_admin)])
async def update_news(news_id: int, news: NewsUpdate):
    if news.image_base64 and len(news.image_base64) > 7_000_000:
        raise HTTPException(413, "Obraz zbyt duży (max ok. 5 MB)")
    updates = news.dict(exclude_unset=True)
    async with db_pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT * FROM news WHERE id=$1", news_id)
        if not existing:
            raise HTTPException(404, "Nie znaleziono")
        if not updates:
            return dict(existing)
        set_parts = [f"{k}=${i+2}" for i, k in enumerate(updates.keys())]
        query = f"UPDATE news SET {', '.join(set_parts)} WHERE id=$1 RETURNING *"
        row = await conn.fetchrow(query, news_id, *updates.values())
        return dict(row)

@app.delete("/news/{news_id}", dependencies=[Depends(require_admin)])
async def delete_news(news_id: int):
    async with db_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM news WHERE id=$1", news_id)
        if result.endswith("0"):
            raise HTTPException(404, "Nie znaleziono")
        return {"ok": True}
