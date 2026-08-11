from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import List
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load backend environment from the backend app directory or the project root if present.
def _load_backend_env():
    env_paths = [
        os.path.join(BASE_DIR, '.env'),
        os.path.join(os.path.dirname(BASE_DIR), '.env'),
    ]
    for path in env_paths:
        if os.path.exists(path):
            load_dotenv(path)
            return

_load_backend_env()

from app.core import processor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = FastAPI(title="RAG Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'^(http://localhost|http://127\.0\.0\.1)(:[0-9]+)?$',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/documents/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    # Validate files and save to uploads folder
    saved = []
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        dest = os.path.join(UPLOAD_FOLDER, f.filename)
        with open(dest, "wb") as out:
            content = await f.read()
            out.write(content)
        saved.append(f.filename)
    # Rebuild vector store from uploads folder
    try:
        vs, chunks = processor.rebuild_vector_store_from_folder(UPLOAD_FOLDER)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process documents: {e}")
    return JSONResponse({"uploaded": saved, "indexed_chunks": chunks})


@app.get("/api/documents")
async def list_documents():
    files = []
    if os.path.exists(UPLOAD_FOLDER):
        for fname in os.listdir(UPLOAD_FOLDER):
            if fname.lower().endswith('.pdf'):
                path = os.path.join(UPLOAD_FOLDER, fname)
                size = os.path.getsize(path)
                files.append({"name": fname, "size": size})
    return {"documents": files}


@app.delete("/api/documents/{name}")
async def delete_document(name: str):
    path = os.path.join(UPLOAD_FOLDER, name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Document not found")
    os.remove(path)
    # Rebuild vector store after deletion
    try:
        vs, chunks = processor.rebuild_vector_store_from_folder(UPLOAD_FOLDER)
    except Exception as e:
        # Not fatal; report but continue
        return JSONResponse({"deleted": name, "warning": f"Rebuild failed: {e}"})
    return {"deleted": name, "indexed_chunks": chunks}


@app.post("/api/chat")
async def chat(payload: dict):
    question = payload.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing question in request body")
    top_k = int(payload.get("top_k", 4))
    try:
        res = processor.query_vector_store(question, top_k=top_k)
    except Exception as e:
        # Return a JSON error response so frontend receives a clear body
        import traceback, datetime
        log_dir = os.path.join(BASE_DIR, 'logs')
        os.makedirs(log_dir, exist_ok=True)
        ts = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        with open(os.path.join(log_dir, f'chat_error_{ts}.log'), 'w', encoding='utf-8') as fh:
            fh.write('Exception during /api/chat:\n')
            fh.write(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": "LLM/query error. See backend logs."})
    return res


@app.get("/api/settings")
async def settings():
    return {
        "embedding_model": os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
        "vector_store_path": os.getenv("VECTOR_STORE_PATH", "7ammadi_vector_store"),
        "chunk_size": int(os.getenv("RAG_CHUNK_SIZE", "1000")),
        "chunk_overlap": int(os.getenv("RAG_CHUNK_OVERLAP", "200")),
        "llm_model": os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    }
