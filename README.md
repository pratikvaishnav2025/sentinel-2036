
# 🛡️ Sentinel 2036
**Autonomous AI Security & QA Intelligence Platform**

Sentinel 2036 is a high-performance security auditing tool that leverages Gemini's neural reasoning to perform defensive scans on Java code, OpenAPI specs, and Smart Contracts.

---

## 🚀 Quick Start (Local)

### 1. Requirements
- **Java 17+** & **Maven 3.8+**
- **Node.js 18+**
- **Google Gemini API Key** (Set as `GEMINI_API_KEY`)

### 2. Build & Run
```bash
# Set your API Key
export GEMINI_API_KEY="your_key_here"

# Build Frontend
cd frontend && npm install && npm run build && cd ..

# Build & Run Backend
mvn spring-boot:run
```
Access at: `http://localhost:8080`

---

## ☁️ Cloud Run Deployment

Sentinel 2036 is optimized for Google Cloud Run.

### 1. Build & Push Image
```bash
PROJECT_ID=$(gcloud config get-value project)
IMAGE_NAME="gcr.io/$PROJECT_ID/sentinel-2036"

# Build image using Cloud Build
gcloud builds submit --tag $IMAGE_NAME .
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy sentinel-2036 \
  --image $IMAGE_NAME \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="API_KEY=$GEMINI_API_KEY"
```

---

## 🧩 Architectural Rules
- **Defense Only:** The platform is hard-coded to ignore requests for exploit generation.
- **Neural Link:** Uses `gemini-3-pro-preview` with high thinking budgets (15k+) for complex reasoning.
- **Storage:** Uses H2 in-memory for the MVP; easily swappable to Postgres for production.

## 🛠 Troubleshooting
- **401 Unauthorized:** Ensure `API_KEY` is correctly passed to the environment.
- **Neural link unstable:** This usually occurs if the payload is too large (>50k chars). Truncate inputs or use specific code snippets.
- **CORS Errors:** If running frontend and backend separately in dev, ensure the Vite proxy in `vite.config.ts` points to `:8080`.
