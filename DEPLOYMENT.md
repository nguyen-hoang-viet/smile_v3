# Deployment Guide

## Pre-deployment Checklist

### Files to Remove/Exclude from Production:
- `backend/migrate_*.py` - Migration/testing scripts
- `backend/check_*.py` - Database check scripts  
- `backend/__pycache__/` - Python cache (excluded by .gitignore)
- `frontend/node_modules/` - Dependencies (excluded by .gitignore)
- `*.log` files - Log files (excluded by .gitignore)

### Environment Variables to Set:
Create `.env` files for production:

#### Backend (.env in backend/)
```
DATABASE_URL=your_production_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
REDIS_URL=your_redis_url
SECRET_KEY=your_secret_key
```

#### Frontend (.env in frontend/)
```
REACT_APP_API_URL=your_backend_api_url
REACT_APP_ENV=production
```

### Build Commands:

#### Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### Frontend:
```bash
cd frontend
npm install
npm run build
```

### Git Commands for Initial Push:
```bash
git add .
git commit -m "Initial commit - Restaurant Management System"
git branch -M main
git remote add origin https://github.com/yourusername/restaurant-management.git
git push -u origin main
```

## Deployment Platforms

### Recommended for Backend (FastAPI):
- Railway
- Render
- Heroku
- DigitalOcean App Platform

### Recommended for Frontend (React):
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## Notes:
- Ensure all sensitive data is in environment variables
- Test the build process locally before deploying
- Set up proper CORS settings for production
- Configure database for production use
