# Deployment Guide

This guide explains how to deploy the Physical AI documentation site to Vercel (frontend) and Koyeb (backend).

## Architecture

```
┌─────────────────┐     API Calls      ┌─────────────────┐
│                 │ ─────────────────► │                 │
│   Vercel        │                    │   Koyeb         │
│   (Frontend)    │                    │   (Backend)     │
│   Docusaurus    │ ◄───────────────── │   FastAPI       │
│                 │    JSON Response   │   + Groq LLM    │
└─────────────────┘                    └─────────────────┘
```

## Step 1: Deploy Backend to Koyeb

### 1.1 Create Koyeb Account
- Go to [koyeb.com](https://www.koyeb.com) and sign up (GitHub login recommended)

### 1.2 Deploy the Service

1. Go to Koyeb Dashboard → **Create App**
2. Select **GitHub** as deployment method
3. Connect your GitHub account and select the repository
4. Configure the service:
   - **Name**: `physical-ai-backend`
   - **Branch**: `main`
   - **Builder**: Docker (auto-detected from Dockerfile)
   - **Dockerfile path**: `rag-backend/Dockerfile`
   - **Work directory**: `rag-backend`
   - **Port**: `8000`

### 1.3 Set Environment Variables

In the deployment configuration, add:
- **GROQ_API_KEY**: Get from [console.groq.com/keys](https://console.groq.com/keys)

### 1.4 Get Your Backend URL

After deployment, copy the URL (e.g., `https://physical-ai-backend-yourusername.koyeb.app`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
- Go to [vercel.com](https://vercel.com) and sign up with GitHub

### 2.2 Deploy

1. Vercel Dashboard → Add New → Project
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `docs`
   - **Framework Preset**: Docusaurus 2
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Set Environment Variables

In Vercel → Your Project → Settings → Environment Variables:
- `RAG_API_URL`: Your Render backend URL (e.g., `https://physical-ai-rag-backend.onrender.com`)

### 2.4 Redeploy

After adding environment variables, redeploy:
- Vercel → Deployments → Redeploy

---

## Verification

1. **Check Backend Health:**
   ```bash
   curl https://your-app.koyeb.app/api/health
   ```
   Should return: `{"status":"ok","docsLoaded":true}`

2. **Test Chat API:**
   ```bash
   curl -X POST https://your-app.koyeb.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"query":"What is Physical AI?"}'
   ```

3. **Test Frontend:**
   - Visit your Vercel URL
   - Open the chat widget
   - Ask a question

---

## Troubleshooting

### Backend Issues

**"Application error" on Koyeb:**
- Check Logs in Koyeb Dashboard → Your App → Logs
- Verify GROQ_API_KEY is set correctly
- Check Docker build logs for dependency issues

**CORS errors:**
- The backend allows all origins by default
- Check browser console for specific errors

### Frontend Issues

**Chat not working:**
- Verify RAG_API_URL is set in Vercel
- Check browser Network tab for failed requests
- Ensure backend is running (check health endpoint)

**Build fails on Vercel:**
- Check Node.js version (needs >=20.0)
- Clear cache and redeploy

---

## Environment Variables Summary

### Koyeb (Backend)
| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Your Groq API key |

### Vercel (Frontend)
| Variable | Value |
|----------|-------|
| `RAG_API_URL` | Your Koyeb backend URL |

---

## Free Tier Limitations

### Koyeb Free Tier
- 1 Nano instance (512MB RAM, 0.1 vCPU)
- Always-on (no cold starts!)
- 100GB bandwidth/month
- Auto-scaling and HTTPS included

### Vercel Free Tier
- Unlimited static deployments
- 100GB bandwidth/month
- Automatic HTTPS

---

## Custom Domain (Optional)

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Service Settings → Custom Domains
2. Add domain and configure DNS
