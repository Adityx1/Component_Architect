import streamlit as st
import os
import json
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

# Ensure we can import from src
import sys
sys.path.append(str(Path(__file__).parent / "src"))

from pipeline import (
    load_design_system,
    generate_component,
)
from session import ComponentSession

# Page Config
st.set_page_config(
    page_title="Guided Component Architect",
    page_icon="⚛️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Load Env
load_dotenv()

# Design System
design_system = load_design_system()

# CSS for styling
st.markdown("""
<style>
    .main {
        background-color: #0f172a;
        color: #f8fafc;
    }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        background-color: #6366f1;
        color: white;
    }
    .stTextInput>div>div>input {
        background-color: #1e293b;
        color: #f8fafc;
        border-radius: 8px;
    }
    .status-box {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    .passing { border: 1px solid #22c55e; background-color: rgba(34, 197, 94, 0.1); }
    .failing { border: 1px solid #ef4444; background-color: rgba(239, 68, 68, 0.1); }
</style>
""", unsafe_allow_html=True)

# Session State Initialization
if "session" not in st.session_state:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        st.error("GROQ_API_KEY not found in environment. Please check your .env file.")
        st.stop()
    client = Groq(api_key=api_key)
    st.session_state.session = ComponentSession(client=client, verbose=False) # verbose false to avoid stdout capture issues

if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar
with st.sidebar:
    st.title("⚛️ Architect Settings")
    
    st.markdown("### Design Tokens")
    with st.expander("Colors"):
        st.json(design_system["tokens"]["colors"])
    with st.expander("Tailwind Mappings"):
        st.json(design_system["tailwind_classes"])
        
    st.divider()
    
    if st.button("Clear Session"):
        st.session_state.messages = []
        api_key = os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        st.session_state.session = ComponentSession(client=client, verbose=False)
        st.rerun()

# Header
st.title("Guided Component Architect")
st.markdown("Transform your descriptions into valid Angular components instantly.")

# Chat Interface / History
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if "code" in msg:
            st.code(msg["code"], language="typescript")
        if "attempts" in msg:
            with st.expander(f"Agentic Loop Details ({len(msg['attempts'])} attempts)"):
                for attempt in msg["attempts"]:
                    status = "✅ PASSED" if attempt["valid"] else "❌ FAILED"
                    st.markdown(f"**Attempt {attempt['attempt']}**: {status}")
                    if attempt["errors"]:
                        for error in attempt["errors"]:
                            st.error(error)

# Input
if prompt := st.chat_input("Describe your component (e.g., 'A login card with glassmorphism effect')"):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Agent Processing
    with st.chat_message("assistant"):
        with st.status("🏗️ Architecting component...", expanded=True) as status:
            try:
                if not st.session_state.session.current_code:
                    # Initial creation
                    st.write("Generating initial design...")
                    result = st.session_state.session.create(prompt)
                else:
                    # Follow-up edit
                    st.write(f"Applying edit: {prompt}")
                    result = st.session_state.session.edit(prompt)
                
                status.update(label="✅ Component finalized!", state="complete", expanded=False)
                
                final_code = result["final_code"]
                attempts = result["attempts"]
                is_valid = result["valid"]
                
                # Display output
                st.code(final_code, language="typescript")
                
                # Save to session history
                response_metadata = {
                    "role": "assistant",
                    "content": "Here is your component component. You can ask for further edits.",
                    "code": final_code,
                    "attempts": attempts,
                    "valid": is_valid
                }
                st.session_state.messages.append(response_metadata)
                
                if not is_valid:
                    st.warning("Component generated with warnings. Check the details for unresolved issues.")
                    
            except Exception as e:
                status.update(label="❌ Error occurred", state="error")
                st.error(f"Failed to generate component: {str(e)}")
                st.session_state.messages.append({"role": "assistant", "content": f"Sorry, I encountered an error: {str(e)}"})

# Help Text
if not st.session_state.messages:
    st.info("Start by describing a UI component. The Architect will ensure it adheres to your Design System.")
