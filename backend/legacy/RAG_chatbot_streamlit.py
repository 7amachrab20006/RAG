from dotenv import load_dotenv
import os
import streamlit as st
import google.generativeai as genai
from PyPDF2 import PdfReader
from langchain_groq import ChatGroq  
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain.chains.question_answering import load_qa_chain

# Charger les variables d'environnement
load_dotenv()
# Create gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def load_pdf(pdf_docs):
    text = ""

    for pdf_doc in pdf_docs:
        pdf_reader = PdfReader(pdf_doc)

        for page in pdf_reader.pages:
                text += page.extract_text()

    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = text_splitter.split_text(text)
    return chunks


def get_vector_store(text_chunks):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    vector_store.save_local("7ammadi_vector_store")
    return vector_store


def get_conversation_chain():
    prompt_template = """You are a helpful AI assistant. Use the following context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. Use three sentences maximum. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

Context: {context}

Question: {question}

Answer:"""
    model = ChatGroq(model="llama-3.3-70b-versatile")
    
    prompt = PromptTemplate(
        template=prompt_template, 
        input_variables=["context", "question"]
    )
    
    chain = load_qa_chain(
        llm=model, 
        chain_type="stuff",
        verbose=True,
        prompt=prompt
    )
    
    return chain


def user_input(user_question):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    new_db = FAISS.load_local("7ammadi_vector_store", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(user_question)
    chain = get_conversation_chain()
    response = chain({"input_documents": docs, "question": user_question}, return_only_outputs=True)
    print(response)
    st.write(" " + response['output_text'])

def main():
    st.set_page_config(page_title="RAG Chatbot", page_icon=":robot_face:")
    st.header("🤖 Chatbot RAG avec Google Gemini")
    user_question =st.text_input("Posez votre question ici :")
    if user_question:
        user_input(user_question)
    with st.sidebar:
        st.subheader("📄 Téléversez vos fichiers PDF")
        pdf_docs = st.file_uploader("Téléversez vos fichiers PDF ici", accept_multiple_files=True, type=["pdf"])
        if st.button("process"):
            with st.spinner("PROCESSSSING..."):
                raw_text = load_pdf(pdf_docs)
                text_chunks = get_text_chunks(raw_text)
                vector_store = get_vector_store(text_chunks)
                st.success("✅ Base de connaissances créée avec succès !")
if __name__ == "__main__":
    main()

