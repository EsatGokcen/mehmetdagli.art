# Mehmet Dağlı — Art Website (mehmetdagli.art)

A modern rebuild of https://mehmetdagliart.com/ using **React (Vite) + TailwindCSS + DaisyUI** on the frontend and **Python (FastAPI)** on the backend. Includes a password-protected `/admin` to manage portfolio, prices, events, and contact info.

## Tech Stack
- Frontend: React + Vite, TailwindCSS, DaisyUI
- Backend: FastAPI (Python), Pydantic
- Auth (admin): Session + hashed password (bcrypt), CSRF protection
- Media: Git LFS for images
- Deployment: TBD (Netlify/Vercel for FE, Fly.io/Render/etc. for BE)
- Domain: mehmetdagli.art (Squarespace domain, DNS to hosting later)

## Local Dev (quick start)
```bash
# Frontend
cd frontend
npm i
npm run dev

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # or: uv pip install -r requirements.txt
uvicorn app.main:app --reload
