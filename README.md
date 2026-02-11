# Django Blog – Capstone Project

Blog with **Django REST API** and **React** frontend. Admins create, edit, and delete articles; registered users view articles and write comments. API documentation: DRF Browsable API at `/api/`.

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

Create a `.env` file (see `.env.example`): `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, database (PostgreSQL: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) or `USE_SQLITE=True`, and `CORS_ORIGINS`.

**Using PostgreSQL:**  
1. Install [PostgreSQL for Windows](https://www.postgresql.org/download/windows/) and note the password you set for the `postgres` user.  
2. Create the database: open **pgAdmin** (or `psql`) and run `CREATE DATABASE blog_db;`  
3. In `.env` set `USE_SQLITE=False`, and set `DB_PASSWORD` to the postgres password. Use `DB_USER=postgres`, `DB_NAME=blog_db`, `DB_HOST=localhost`, `DB_PORT=5432` unless you changed them.

```bash
python manage.py migrate
python manage.py setup_groups
python manage.py seed_data
python manage.py runserver
```

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
| GET | `/api/articles/` | List articles, optional `?search=` |
| GET | `/api/articles/<id>/` | One article |
| POST | `/api/articles/` | Create article (Admin) |
| PUT/PATCH | `/api/articles/<id>/` | Update article (Admin) |
| DELETE | `/api/articles/<id>/` | Delete article (Admin) |
| GET | `/api/articles/<id>/comments/` | List comments |
| POST | `/api/articles/<id>/comments/` | Add comment (authenticated) |
| GET | `/api/comments/<id>/` | One comment |
| PATCH | `/api/comments/<id>/` | Update comment (owner) |
| DELETE | `/api/comments/<id>/` | Delete comment (admin or owner) |

## Seeded data

After `python manage.py seed_data`: users `admin1`, `editor1`, `reader1` (password `password123`), 2 articles, 2 comments per article.

## Where your data is in PostgreSQL

1. Open **pgAdmin**.
2. In the left tree: **Servers** → **PostgreSQL** (double‑click to connect if needed) → **Databases** → **blog_db**.
3. Expand **blog_db** → **Schemas** → **public** → **Tables**.
4. Your data:
   - **auth_user** – users (admin1, editor1, reader1, plus any you register).
   - **blog_article** – articles (title, content, author, etc.).
   - **blog_comment** – comments (linked to article and user).
   - **blog_tag** – tags (e.g. Technology, News).
   - **auth_group** – groups (Admin, Editors, Users).

Right‑click a table → **View/Edit Data** → **All Rows** to see the rows.

## Deploy (production)

1. On the server: set env vars — `SECRET_KEY` (long random), `DEBUG=False`, `ALLOWED_HOSTS=yourdomain.com`, `CORS_ORIGINS=https://yourdomain.com`, and PostgreSQL `DB_*` (no SQLite in production).
2. Backend: `pip install -r requirements.txt`, `python manage.py migrate --noinput`, `python manage.py setup_groups`, `python manage.py collectstatic --noinput`, then start with `gunicorn config.wsgi:application --bind 0.0.0.0:8000` (or `--bind 0.0.0.0:$PORT` on Heroku/Railway/Render).
3. Frontend: `cd frontend && npm run build`; serve the `dist` folder and proxy `/api` to the Django app.

## Git

Do not commit `venv/` or `.env`. Submit the Git repository link and include this README.
