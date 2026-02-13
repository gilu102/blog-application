# Gil's Blog

בלוג עם **Django REST API** ופרונט **React** — מאמרים, תגובות, צ'אט, אודות, איפוס סיסמה ואימות משתמשים.

**Features:** Articles & tags, comments, ratings, global chat (Gil's Lounge), light/dark mode, About Me + CV download, File System Tracking (password reset **with email** + human verification), **file upload** (Files page), role-based CRUD (Admin / Creator / User), **API tests** (pytest), **accessibility** (aria-labels, focus-visible).

## Tech stack

- **Backend:** Django, Django REST Framework, Simple JWT, django-filter, django-cors-headers, PostgreSQL (or SQLite), python-decouple
- **Frontend:** React, React Router, Axios, Vite

## Setup

### Backend

```bash
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file (see `.env.example`): `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, database (PostgreSQL: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) or `USE_SQLITE=True`, `CORS_ORIGINS`, and optionally `FRONTEND_RESET_URL` (for password-reset email link; default `http://localhost:3000/reset-password`).

**Using PostgreSQL:**  
1. Install [PostgreSQL for Windows](https://www.postgresql.org/download/windows/) and note the password you set for the `postgres` user.  
2. Create the database: open **pgAdmin** (or `psql`) and run `CREATE DATABASE blog_db;`  
3. In `.env` set `USE_SQLITE=False`, and set `DB_PASSWORD` to the postgres password. Use `DB_USER=postgres`, `DB_NAME=blog_db`, `DB_HOST=localhost`, `DB_PORT=5432` unless you changed them.

```bash
python manage.py migrate   # includes SystemTrackingLog for password reset & human verification
python manage.py setup_groups
python manage.py seed_data
python manage.py runserver
```

**CV download:** Place your resume as `frontend/public/cv/Gil_CV.docx` so the About page "Download CV" link works (e.g. copy `קורות חיים גיל.docx` there and rename to `Gil_CV.docx`).

API: `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000` (proxies `/api` to backend). Start the backend first.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register/` | Register |
| POST | `/api/token/` | JWT login |
| POST | `/api/token/refresh/` | Refresh token |
| GET | `/api/me/` | Current user (id, username, groups) — authenticated |
| GET | `/api/tags/` | List tags |
| GET | `/api/articles/` | List articles, optional `?search=` |
| GET | `/api/articles/<id>/` | One article |
| POST | `/api/articles/` | Create article (Admin / Creator) |
| PATCH | `/api/articles/<id>/` | Update article (Admin or owner Creator) |
| DELETE | `/api/articles/<id>/` | Delete article (Admin or owner Creator) |
| GET | `/api/articles/<id>/comments/` | List comments |
| POST | `/api/articles/<id>/comments/` | Add comment (authenticated) |
| GET | `/api/articles/<id>/rating/` | Get rating |
| POST | `/api/articles/<id>/rating/` | Set rating 1–5 (authenticated) |
| GET | `/api/comments/<id>/` | One comment |
| PATCH | `/api/comments/<id>/` | Update comment (owner) |
| DELETE | `/api/comments/<id>/` | Delete comment (admin or owner) |
| GET | `/api/chat/` | List last 100 chat messages |
| POST | `/api/chat/` | Send chat message (authenticated) |
| POST | `/api/password-reset/` | Request password reset (sends email with link; tracked) |
| POST | `/api/password-reset/confirm/` | Set new password (body: `uid`, `token`, `new_password`) |
| POST | `/api/verify-human/` | Human verification (tracked) |
| GET | `/api/files/` | List uploaded files |
| POST | `/api/files/` | Upload file (multipart; authenticated) |
| DELETE | `/api/files/<id>/` | Delete file (admin or owner) |

## Tests

```bash
pip install -r requirements.txt   # includes pytest, pytest-django
pytest
```

## Seeded data

After `python manage.py seed_data`: default 50 users, 50 articles, 50 chat messages, comments, ratings, tags and files. Optional: `--clear` to clear before seeding, `--count N` (default 50). Example: `python manage.py seed_data --clear --count 50`.

## Where your data is in PostgreSQL

1. Open **pgAdmin**.
2. In the left tree: **Servers** → **PostgreSQL** (double‑click to connect if needed) → **Databases** → **blog_db**.
3. Expand **blog_db** → **Schemas** → **public** → **Tables**.
4. Your data:
   - **auth_user** – users (admin1, editor1, reader1, plus any you register).
   - **blog_article** – articles (title, content, author, tags).
   - **blog_comment** – comments (linked to article and user).
   - **blog_tag** – tags (e.g. Technology, News).
   - **blog_chatmessage** – global chat messages.
   - **blog_articlerating** – article ratings (1–5).
   - **blog_systemtrackinglog** – password reset requests & human verification logs.
   - **blog_uploadedfile** – uploaded files (Files page).
   - **auth_group** – groups (Admin, Editors, Users).

Right‑click a table → **View/Edit Data** → **All Rows** to see the rows.

## העלאה ל-GitHub / Push to GitHub

1. **וודא שלא נכנסים קבצים רגישים:**  
   `.gitignore` כבר מונע: `venv/`, `.env`, `node_modules/`, `db.sqlite3`, `staticfiles/`, `frontend/dist/`.

2. **אתחול ריפו (אם עדיין לא):**
   ```bash
   cd c:\Users\ASUS\OneDrive\projectsInMiniLaptop\final-django-project
   git init
   ```

3. **הוספת קבצים וע commit:**
   ```bash
   git add .
   git status   # בדוק שאין .env או venv
   git commit -m "Gil's Blog: Django + React, chat, about, file tracking, light/dark"
   ```

4. **חיבור ל-GitHub והעלאה:**
   - צור **repository חדש** ב-GitHub (בלי README, בלי .gitignore).
   - אחר כך:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   (החלף `YOUR_USERNAME` ו-`YOUR_REPO_NAME` בשם המשתמש ובשם הריפו שלך.)

5. **אם הריפו כבר קיים ומחובר:**  
   ```bash
   git add .
   git status
   git commit -m "Update: chat lounge, about, file tracking, README"
   git push
   ```

**חשוב:** אל תעלה את הקובץ `.env` (יש בו סיסמאות). השתמש ב-`.env.example` כתבנית.
