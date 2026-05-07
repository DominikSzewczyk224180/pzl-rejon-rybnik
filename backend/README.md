# Backend — PZŁ Rejon Rybnicki

FastAPI + PostgreSQL. Hosting: Railway.

## Wdrożenie na Railway (krok po kroku)

### 1. Załóż konto Railway
https://railway.app — możesz zalogować się GitHubem.

### 2. Stwórz nowy projekt
- Dashboard → **New Project** → **Deploy from GitHub repo**
- Wybierz swoje repo `pzl-rejon-rybnik`
- Railway zauważy folder `backend/` — w ustawieniach **Service** ustaw **Root Directory** na `backend`

### 3. Dodaj bazę PostgreSQL
- W projekcie kliknij **+ New** → **Database** → **Add PostgreSQL**
- Railway automatycznie ustawi zmienną `DATABASE_URL` dla Twojego serwisu

### 4. Ustaw zmienne środowiskowe
W zakładce **Variables** Twojego serwisu (nie bazy!) dodaj:

| Zmienna | Wartość |
|---|---|
| `SECRET_KEY` | wygeneruj: `openssl rand -hex 32` (lub dowolny długi losowy ciąg) |
| `ADMIN_PASSWORD` | Twoje hasło do panelu admina |
| `ALLOWED_ORIGINS` | `https://dominikszewczyk224180.github.io` (Twoja domena frontu) |

`DATABASE_URL` ustawi się sam dzięki krokowi 3.

### 5. Wygeneruj publiczny URL
- Zakładka **Settings** → **Networking** → **Generate Domain**
- Skopiuj URL (np. `https://pzl-backend-production.up.railway.app`)

### 6. Połącz frontend z backendem
W pliku `script.js` w głównym folderze repo zmień:
```js
const API_BASE = 'https://TWOJ-RAILWAY-URL.up.railway.app';
```
na URL z kroku 5. Push do GitHuba — GitHub Pages odświeży frontend.

### 7. Pierwsze logowanie
- Otwórz stronę
- W prawym dolnym rogu kliknij dyskretną ikonę admina (kółko zębate)
- Wpisz hasło z `ADMIN_PASSWORD`
- Zacznij dodawać aktualności!

## Lokalne uruchomienie (do testów)

```bash
cd backend
python -m venv venv
source venv/bin/activate    # lub .\venv\Scripts\activate na Windows
pip install -r requirements.txt
cp .env.example .env
# Edytuj .env — wpisz lokalne dane (możesz użyć Postgres lokalnie albo darmowy Neon/Supabase)
uvicorn main:app --reload
```

API będzie pod `http://localhost:8000`. Dokumentacja Swagger pod `http://localhost:8000/docs`.

## Endpointy

| Metoda | Endpoint | Auth | Opis |
|---|---|---|---|
| `GET` | `/news` | nie | Lista aktualności |
| `GET` | `/news/upcoming` | nie | Najbliższe wydarzenie (event_date >= now) |
| `GET` | `/news/{id}` | nie | Szczegóły jednej aktualności |
| `POST` | `/admin/login` | nie | Logowanie (zwraca JWT) |
| `POST` | `/news` | tak | Dodaj aktualność |
| `PUT` | `/news/{id}` | tak | Edytuj aktualność |
| `DELETE` | `/news/{id}` | tak | Usuń aktualność |

## Notatki

- Obrazy są zapisywane jako base64 w bazie (limit ~5 MB na obraz)
- Token JWT ważny 24 h
- Aktualność z polem `event_date` w przyszłości pojawia się jako "Najbliższe wydarzenie" na stronie głównej
