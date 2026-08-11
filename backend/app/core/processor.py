import os
from typing import List, Tuple
from dotenv import load_dotenv
from PyPDF2 import PdfReader

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Support loading the backend .env from both the app directory and the backend project root.
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

VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "7ammadi_vector_store")
if not os.path.isabs(VECTOR_STORE_PATH):
    VECTOR_STORE_PATH = os.path.join(BASE_DIR, VECTOR_STORE_PATH)
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "200"))
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")


def load_pdf_from_bytes(file_bytes: bytes) -> str:
    """Extract text from a PDF file given its bytes."""
    text = ""
    reader = PdfReader(file_bytes)
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def load_pdf_from_path(path: str) -> str:
    text = ""
    reader = PdfReader(path)
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def get_text_chunks(text: str, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)


def get_vector_store(text_chunks: List[str], save_path: str = VECTOR_STORE_PATH) -> FAISS:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vector_store = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    vector_store.save_local(save_path)
    return vector_store


def rebuild_vector_store_from_folder(folder_path: str, save_path: str = VECTOR_STORE_PATH) -> Tuple[FAISS, int]:
    """Read all PDFs in a folder, extract text, chunk, and build a vector store. Returns (vector_store, number_of_chunks)."""
    texts = []
    if os.path.exists(folder_path):
        for fname in os.listdir(folder_path):
            if fname.lower().endswith(".pdf"):
                p = os.path.join(folder_path, fname)
                try:
                    t = load_pdf_from_path(p)
                    texts.append(t)
                except Exception:
                    continue
    combined = "\n".join(texts)
    chunks = get_text_chunks(combined) if combined.strip() else []
    
    if len(chunks) == 0:
        # Create placeholder empty vector store so queries won't crash on empty store
        vs = get_vector_store(["No context available."], save_path=save_path)
        return vs, 0
        
    vs = get_vector_store(chunks, save_path=save_path)
    return vs, len(chunks)


def get_conversation_chain():
    prompt_template = """You are a helpful AI assistant. Use the following context to answer the question at the end. If you don't know the answer, say you don't know. Use a maximum of three sentences.

Context: {context}

Question: {question}

Answer:"""

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables.")

    # Initialize ChatGroq with explicit key and model
    model = ChatGroq(model=LLM_MODEL, groq_api_key=groq_api_key)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    def chain_runner(inputs: dict, return_only_outputs: bool = True):
        docs = inputs.get("input_documents", [])
        context = "\n\n".join([getattr(d, "page_content", str(d)) for d in docs])
        question = inputs.get("question", "")

        formatted_prompt = prompt.format(context=context, question=question)
        
        try:
            ai_msg = model.invoke(formatted_prompt)
            text = getattr(ai_msg, "content", str(ai_msg))
            return {"output_text": text}
        except Exception as err:
            import datetime, traceback
            log_dir = os.path.join(os.getcwd(), 'backend', 'logs')
            os.makedirs(log_dir, exist_ok=True)
            ts = datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            with open(os.path.join(log_dir, 'latest_chain_run_error.log'), 'w', encoding='utf-8') as fh:
                fh.write(f"Timestamp: {ts}\nGroq API Error: {err}\n\nTraceback:\n{traceback.format_exc()}")
            return {"output_text": f"Groq LLM Error: {str(err)}"}

    return chain_runner

def query_vector_store(question: str, top_k: int = 4, vector_store_path: str = VECTOR_STORE_PATH) -> dict:
    if not os.path.exists(vector_store_path):
        return {
            "answer": f"Vector store directory '{vector_store_path}' does not exist. Please upload a document first.",
            "sources": []
        }

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    db = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
    docs = db.similarity_search(question, k=top_k)
    
    sources = [
        {
            "page_content": d.page_content[:500],
            "metadata": getattr(d, 'metadata', {})
        }
        for d in docs
    ]

    try:
        chain = get_conversation_chain()
        result = chain({"input_documents": docs, "question": question}, return_only_outputs=True)
        return {
            "answer": result.get("output_text") if isinstance(result, dict) else str(result),
            "sources": sources
        }
    except Exception as e:
        # Return the exact exception string directly to the UI
        return {
            "answer": f"Backend Error: {str(e)}",
            "sources": sources
        }