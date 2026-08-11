# RAG project — FastAPI backend + React frontend

This repository was converted from a Streamlit-based UI to a production-style frontend + backend separation.

Summary of changes made by the conversion process in this session:

- Added a FastAPI backend that preserves the original AI/RAG pipeline (PDF extraction, text splitting, HuggingFace embeddings, FAISS vector store, and LLM prompting using langchain_groq).
- Added a React + Vite + TypeScript + Tailwind frontend scaffold with a Dashboard, Upload panel, and Chat panel.
- Added endpoints for document upload, listing, deletion, chat, and settings.
- Left the original Streamlit script (`RAG_chatbot.py`) in the repository as a reference (it is not used by the new stack).

Important: the actual AI pipeline is preserved in backend/app/core/processor.py and the API is in backend/app/main.py.

Quick start (development):

1) Backend

- Create a Python virtual environment and activate it.
- Install dependencies (from backend folder):

  cd backend
  pip install -r requirements.txt

- Create a `.env` file in `backend/` (or set environment variables) — see `backend/.env.example`.
- Start the backend server:

  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

2) Frontend

- From project root:

  cd frontend
  npm install
  npm run dev

- Open the UI at the Vite dev URL (default http://localhost:5173)

Notes and caveats:

- The backend retains the same embedding and LLM configuration default values as the original Streamlit app. Make sure you have appropriate API keys (e.g. GEMINI_API_KEY) set in `backend/.env`.
- FAISS may require platform-specific wheels (faiss-cpu). If installation fails on Windows, consider using a different vectorstore (Chroma) or running on Linux/macOS.
- The frontend is a professional scaffold — it includes upload, chat, document list and basic settings. It calls the FastAPI endpoints defined in `backend/app/main.py`.

Files created or modified by this migration:

- backend/app/core/processor.py (new)
- backend/app/main.py (new)
- backend/requirements.txt (new)
- backend/.env.example (new)
- frontend/ (new folder)
  - package.json
  - vite.config.ts
  - postcss.config.cjs
  - tailwind.config.cjs
  - public/index.html
  - src/main.tsx
  - src/App.tsx
  - src/index.css
  - src/pages/Dashboard.tsx
  - src/components/UploadPanel.tsx
  - src/components/ChatPanel.tsx
  - src/components/SettingsPanel.tsx
  - src/services/api.ts
  - src/services/documentService.ts
  - src/services/chatService.ts
  - frontend/.env.example

- Original Streamlit script `RAG_chatbot.py` left unchanged as a reference.

If you'd like, next steps I can take now (pick one):

- Remove Streamlit and its imports from the repository and adjust requirements.
- Expand the frontend with conversation history, regenerate response, copy buttons, dark mode and settings editing.
- Improve backend to persist conversations and provide source document/page references more precisely.

Tell me which of the above you want next or I can proceed to remove Streamlit references and finalize the migration.
# RAG
