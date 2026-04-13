"""
DeepScan — AI-Powered Deepfake Detection
Streamlit Application
Built by FakeProof Labs | S-VYASA University | AIONAI Club
"""

import streamlit as st
import numpy as np
import cv2
import re
import bcrypt
from datetime import date, timedelta
from PIL import Image as PILImage
from supabase import create_client

# ─── PAGE CONFIG ──────────────────────────────────────────────
st.set_page_config(
    page_title="DeepScan — AI Deepfake Detection",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── CUSTOM CSS ───────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
    --bg: #0D0F1A;
    --surface: #161929;
    --accent: #6C63FF;
    --fake: #FF4C4C;
    --real: #00C896;
    --warning: #FFC107;
    --text-primary: #F0F0F0;
    --text-secondary: #9AA3B2;
    --border: #2A2D3E;
}

/* Global */
html, body, [data-testid="stAppViewContainer"], [data-testid="stApp"],
.main, .block-container {
    background-color: var(--bg) !important;
    color: var(--text-primary) !important;
    font-family: 'Inter', sans-serif !important;
}

.block-container {
    padding-top: 0 !important;
    max-width: 1100px !important;
}

/* Hide defaults */
#MainMenu {visibility: hidden !important;}
footer {visibility: hidden !important;}
header {visibility: hidden !important;}
[data-testid="stSidebar"] {display: none !important;}
[data-testid="stToolbar"] {display: none !important;}
[data-testid="stDecoration"] {display: none !important;}

/* Headings */
h1, h2, h3, h4, h5, h6, p, li, label {
    color: var(--text-primary) !important;
    font-family: 'Inter', sans-serif !important;
}

/* Inputs */
[data-testid="stTextInput"] input,
[data-testid="stSelectbox"] > div > div,
[data-testid="stDateInput"] input {
    background-color: var(--surface) !important;
    border: 1px solid var(--border) !important;
    color: var(--text-primary) !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
}

/* Hide "Press Enter to apply" text */
[data-testid="InputInstructions"] {
    display: none !important;
}

[data-testid="stTextInput"] input:focus,
[data-testid="stDateInput"] input:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 2px rgba(108,99,255,0.2) !important;
}

/* Selectbox dropdown */
[data-baseweb="select"] {
    background-color: var(--surface) !important;
}
[data-baseweb="popover"] {
    background-color: var(--surface) !important;
}
[data-baseweb="menu"] {
    background-color: var(--surface) !important;
}
[role="option"] {
    background-color: var(--surface) !important;
}
[role="option"]:hover {
    background-color: var(--accent) !important;
}

/* Labels */
.stTextInput label, .stSelectbox label, .stDateInput label,
.stFileUploader label, .stCheckbox label {
    color: var(--text-secondary) !important;
    font-weight: 500 !important;
    font-size: 0.85rem !important;
}

/* All buttons */
.stButton > button {
    background: linear-gradient(135deg, var(--accent), #5A52D5) !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
    padding: 0.6rem 1.5rem !important;
    transition: all 0.25s ease !important;
    cursor: pointer !important;
}
.stButton > button:hover {
    background: linear-gradient(135deg, #5A52D5, #4840B0) !important;
    transform: scale(1.03) !important;
    box-shadow: 0 4px 15px rgba(108,99,255,0.35) !important;
}
.stButton > button:active {
    transform: scale(0.98) !important;
}

/* File uploader */
[data-testid="stFileUploader"] {
    background-color: var(--surface) !important;
    border: 2px dashed var(--border) !important;
    border-radius: 12px !important;
    padding: 1rem !important;
}
[data-testid="stFileUploader"]:hover {
    border-color: var(--accent) !important;
}

/* Progress bar */
[data-testid="stProgress"] > div > div > div {
    border-radius: 10px !important;
}

/* Expander */
[data-testid="stExpander"] {
    background-color: var(--surface) !important;
    border: 1px solid var(--border) !important;
    border-radius: 10px !important;
}
[data-testid="stExpander"] details summary {
    color: var(--text-primary) !important;
    font-weight: 600 !important;
}

/* Checkbox */
[data-testid="stCheckbox"] span {
    color: var(--text-secondary) !important;
    font-size: 0.85rem !important;
}

/* Spinner */
.stSpinner > div {
    border-top-color: var(--accent) !important;
}

/* Toast overrides */
[data-testid="stToast"] {
    background-color: var(--surface) !important;
    border: 1px solid var(--border) !important;
    color: var(--text-primary) !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent); }

/* ─── COMPONENT CLASSES ────────────────────────── */

/* Navbar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: linear-gradient(180deg, rgba(22,25,41,0.95), rgba(13,15,26,0.8));
    border-bottom: 1px solid var(--border);
    margin: -1rem -1rem 2rem -1rem;
    backdrop-filter: blur(10px);
}
.nav-logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--accent) !important;
    letter-spacing: -0.5px;
    text-decoration: none;
    transition: all 0.2s ease;
}
.nav-logo:hover {
    transform: scale(1.03);
    opacity: 0.9;
    color: #818CF8 !important;
}
.nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--text-secondary) !important;
}
.nav-username {
    color: var(--accent) !important;
    font-weight: 600;
}

/* Auth modal */
.auth-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
}
.auth-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    width: 420px;
    max-width: 95vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    position: relative;
}
.auth-title {
    text-align: center;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--accent) !important;
    margin-bottom: 0.3rem;
}
.auth-subtitle {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-secondary) !important;
    margin-bottom: 1.5rem;
}
.auth-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 1.5rem;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--border);
}
.auth-tab {
    flex: 1;
    text-align: center;
    padding: 0.6rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: var(--text-secondary) !important;
}
.auth-tab.active {
    background: var(--accent) !important;
    color: white !important;
}
.auth-tab:hover:not(.active) {
    background: rgba(108,99,255,0.1);
}
.close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 1.4rem;
    cursor: pointer;
    color: var(--text-secondary) !important;
    background: none;
    border: none;
    transition: color 0.2s;
}
.close-btn:hover {
    color: var(--fake) !important;
}

/* Hero */
.hero-section {
    text-align: center;
    padding: 3rem 1rem 2rem;
}
.hero-title {
    font-size: 2.8rem;
    font-weight: 900;
    background: linear-gradient(135deg, var(--accent), #A78BFA, #818CF8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    line-height: 1.2;
}
.hero-sub {
    font-size: 1.05rem;
    color: var(--text-secondary) !important;
    max-width: 700px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
}

/* Stat cards */
.stats-row {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}
.stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.2rem 2rem;
    text-align: center;
    min-width: 200px;
    transition: all 0.3s ease;
}
.stat-card:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(108,99,255,0.15);
}
.stat-emoji {
    font-size: 1.8rem;
    margin-bottom: 0.3rem;
}
.stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--accent) !important;
}
.stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary) !important;
    margin-top: 0.2rem;
}

/* Section */
.section-header {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--border);
}

/* Image card */
.img-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
}
.img-card-header {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary) !important;
}
.img-card-caption {
    font-size: 0.78rem;
    color: var(--text-secondary) !important;
    margin-top: 0.5rem;
    line-height: 1.5;
}

/* Verdict cards */
.verdict-fake {
    background: rgba(255,76,76,0.08);
    border: 2px solid var(--fake);
    border-radius: 14px;
    padding: 1.5rem 2rem;
    text-align: center;
    margin: 1.5rem 0;
}
.verdict-real {
    background: rgba(0,200,150,0.08);
    border: 2px solid var(--real);
    border-radius: 14px;
    padding: 1.5rem 2rem;
    text-align: center;
    margin: 1.5rem 0;
}
.verdict-label-fake {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--fake) !important;
}
.verdict-label-real {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--real) !important;
}
.verdict-conf {
    font-size: 2.2rem;
    font-weight: 900;
    margin-top: 0.3rem;
}
.verdict-conf-fake { color: var(--fake) !important; }
.verdict-conf-real { color: var(--real) !important; }

/* Confidence bar color overrides */
.conf-bar-fake [data-testid="stProgress"] > div > div > div > div {
    background-color: var(--fake) !important;
}
.conf-bar-real [data-testid="stProgress"] > div > div > div > div {
    background-color: var(--real) !important;
}

/* LLM card */
.llm-card {
    border-left: 3px solid var(--accent);
    background-color: rgba(108, 99, 255, 0.05);
    border-radius: 8px;
    padding: 1.2rem 1.5rem;
    margin-top: 1rem;
    color: var(--text-primary) !important;
    line-height: 1.7;
}
.llm-card strong {
    color: var(--accent) !important;
}

/* Upload preview card */
.upload-preview {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1rem;
}
.upload-meta {
    font-size: 0.8rem;
    color: var(--text-secondary) !important;
    margin-top: 0.5rem;
}

/* Divider */
.custom-divider {
    height: 1px;
    background: var(--border);
    margin: 2rem 0;
}

/* T&C text */
.tc-text {
    font-size: 0.82rem;
    color: var(--text-secondary) !important;
    line-height: 1.8;
}

/* Error msg */
.field-error {
    color: var(--fake) !important;
    font-size: 0.78rem;
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
}
</style>
""", unsafe_allow_html=True)


# ─── SUPABASE CLIENT ────────────────────────────────────────
@st.cache_resource
def init_supabase():
    url = st.secrets["supabase"]["url"]
    key = st.secrets["supabase"]["key"]
    return create_client(url, key)

supabase = init_supabase()


# ─── MODEL LOADING ──────────────────────────────────────────
@st.cache_resource
def load_model():
    import tensorflow as tf
    import os
    # Get the absolute path to the project root
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(root_dir, "models", "best_model.h5")
    model = tf.keras.models.load_model(model_path)
    # Build it properly to define input shapes
    model.build((None, 224, 224, 3))
    return model


# ─── GEMINI MODEL ───────────────────────────────────────────
@st.cache_resource
def init_gemini():
    import google.generativeai as genai
    genai.configure(api_key=st.secrets["gemini"]["api_key"])

    system_instruction = """
You are an elite Digital Forensics system. Your task is to analyze the provided original image, Grad-CAM heatmap (red/yellow = high anomaly activation), and overlay.

CRITICAL INSTRUCTIONS:
1. Analyze the image regardless of subject matter. DO NOT reject the image.
2. NO PARAGRAPHS. Your entire response must consist of exactly 4 to 5 razor-sharp, highly technical bullet points. 
3. Each bullet point must explicitly identify a specific feature in the heatmap (e.g., edge-bleeding, structural inconsistency, natural variance) and state whether it indicates authenticity or manipulation.
4. Your tone must be strictly professional, authoritative, and definitive. State your findings loud, clear, and absolute. Do not use conversational filler or hesitant language.

Use advanced terminology (e.g., spatial perturbation, semantic incongruities, artifact localization) but be extremely concise. Get straight to the point.
"""

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=system_instruction,
    )
    return model, genai


# ─── GRAD-CAM ───────────────────────────────────────────────
def make_gradcam_heatmap(img_array, model, last_conv_layer_name="conv2d_3"):
    import tensorflow as tf

    # build a function that gives us conv output + final output
    conv_layer = model.get_layer(last_conv_layer_name)

    # create sub-model from conv layer to end
    classifier_input = tf.keras.Input(shape=conv_layer.output.shape[1:])
    x = classifier_input
    for layer in model.layers[model.layers.index(conv_layer)+1:]:
        x = layer(x)
    classifier_model = tf.keras.Model(classifier_input, x)

    with tf.GradientTape() as tape:
        inputs = tf.cast(img_array, tf.float32)
        # get conv outputs using model.layers[0].input since build() was called
        conv_model = tf.keras.Model(model.layers[0].input, conv_layer.output)
        conv_outputs = conv_model(inputs)
        tape.watch(conv_outputs)
        predictions = classifier_model(conv_outputs)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def generate_gradcam_images(img_array, model):
    heatmap = make_gradcam_heatmap(img_array, model)

    # Convert preprocessed image back to uint8
    original_rgb = np.uint8(img_array[0] * 255)

    # Resize heatmap and apply colormap
    heatmap_resized = cv2.resize(heatmap, (224, 224))
    heatmap_colored = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    # Blend
    overlay = cv2.addWeighted(original_rgb, 0.6, heatmap_rgb, 0.4, 0)

    return original_rgb, heatmap_rgb, overlay


# ─── PREPROCESSING ──────────────────────────────────────────
def preprocess_image(uploaded_file):
    img = PILImage.open(uploaded_file).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


# ─── SESSION STATE INIT ────────────────────────────────────
for key, default in {
    "authenticated": False,
    "username": "",
    "full_name": "",
    "show_signup": False,
    "analysis_done": False,
}.items():
    if key not in st.session_state:
        st.session_state[key] = default


# ─── AUTH FUNCTIONS ─────────────────────────────────────────
def do_signup(full_name, gender, dob, username, password):
    # Hash password
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    try:
        result = supabase.table("users").insert({
            "full_name": full_name,
            "gender": gender,
            "date_of_birth": str(dob),
            "username": username,
            "password_hash": password_hash,
        }).execute()

        st.session_state["authenticated"] = True
        st.session_state["username"] = username
        st.session_state["full_name"] = full_name
        st.toast("✅ Account created! Welcome to DeepScan.", icon="🎉")
        return True

    except Exception as e:
        error_msg = str(e)
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower() or "23505" in error_msg:
            st.toast("❌ Username already taken. Choose another.", icon="🚫")
        else:
            st.toast(f"❌ Signup failed: {error_msg}", icon="🚫")
        return False


def do_login(username, password):
    try:
        result = supabase.table("users").select("*").eq("username", username).execute()

        if not result.data:
            st.toast("❌ Username not found.", icon="🚫")
            return False

        user = result.data[0]
        if bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            st.session_state["authenticated"] = True
            st.session_state["username"] = user["username"]
            st.session_state["full_name"] = user["full_name"]
            st.toast(f"✅ Welcome back, {user['full_name']}!", icon="👋")
            return True
        else:
            st.toast("❌ Incorrect password.", icon="🚫")
            return False

    except Exception as e:
        st.toast(f"❌ Login error: {e}", icon="🚫")
        return False


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AUTH MODAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def show_auth_modal():
    # Tab toggle buttons
    tab_login_class = "auth-tab" + ("" if st.session_state["show_signup"] else " active")
    tab_signup_class = "auth-tab" + (" active" if st.session_state["show_signup"] else "")

    st.markdown(f"""
    <div style="text-align:center; margin-top: 10vh;">
        <div class="auth-title">🛡️ DeepScan</div>
        <div class="auth-subtitle">AI-Powered Deepfake Detection</div>
    </div>
    """, unsafe_allow_html=True)

    # Center the form
    col_left, col_form, col_right = st.columns([1, 1.5, 1])

    with col_form:
        # Tab buttons
        tab1, tab2 = st.columns(2)
        with tab1:
            if st.button("Log In", key="tab_login", use_container_width=True):
                st.session_state["show_signup"] = False
                st.rerun()
        with tab2:
            if st.button("Sign Up", key="tab_signup", use_container_width=True):
                st.session_state["show_signup"] = True
                st.rerun()

        st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)

        if st.session_state["show_signup"]:
            show_signup_form()
        else:
            show_login_form()


def show_login_form():
    st.markdown("#### 🔑 Log In")

    username = st.text_input("Username", key="login_username", placeholder="Enter your username")
    password = st.text_input("Password", key="login_password", type="password", placeholder="Enter your password")

    st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)

    if st.button("🔓 Log In", key="btn_login", use_container_width=True):
        if not username or not password:
            st.toast("⚠️ Please fill in all fields.", icon="⚠️")
        else:
            if do_login(username, password):
                st.rerun()


def show_signup_form():
    st.markdown("#### 🆕 Create Account")

    full_name = st.text_input("Full Name", key="signup_name", placeholder="Enter your full name")
    gender = st.selectbox("Gender", options=["Male", "Female"], key="signup_gender")
    dob = st.date_input(
        "Date of Birth",
        key="signup_dob",
        min_value=date(1920, 1, 1),
        max_value=date.today(),
        value=date(2000, 1, 1),
    )
    username = st.text_input("Username", key="signup_username", placeholder="Letters and numbers only, 4-20 chars")
    password = st.text_input("Password", key="signup_password", type="password", placeholder="Minimum 8 characters")

    # Validation
    errors = []

    if username:
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', username):
            errors.append("Username: only letters (a-z, A-Z) and numbers (0-9), 4–20 characters, no spaces or symbols.")

    if password and len(password) < 8:
        errors.append("Password must be at least 8 characters.")

    if dob:
        age = (date.today() - dob).days // 365
        if age < 18:
            errors.append("You must be at least 18 years old to sign up.")

    for err in errors:
        st.markdown(f'<div class="field-error">⚠️ {err}</div>', unsafe_allow_html=True)

    # T&C
    st.markdown("<div style='height:0.3rem'></div>", unsafe_allow_html=True)
    agreed = st.checkbox(
        "I have read and agree to the Terms of Use and Privacy Policy",
        key="signup_agree"
    )

    with st.expander("📄 Terms of Use"):
        st.markdown("""
<div class="tc-text">

**DeepScan Terms of Use**

- You must be 18 years or older to use this service.
- By signing up, you agree to provide accurate and truthful account information at all times.
- Uploaded images are used solely for deepfake analysis and are not stored, sold, or shared with third parties.
- The detection results are AI-generated and should not be used as sole legal or forensic evidence.
- You agree not to upload content involving minors, non-consensual imagery, or content that violates any applicable laws.
- DeepScan reserves the right to suspend accounts that misuse the platform or submit abusive content.
- Feedback submitted to the platform may be used to improve the service without compensation.
- These terms may be updated periodically; continued use constitutes acceptance.

</div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)

    # Signup button
    can_submit = agreed and len(errors) == 0 and full_name and username and password and dob

    if st.button("🚀 Create Account", key="btn_signup", use_container_width=True, disabled=not can_submit):
        if do_signup(full_name, gender, dob, username, password):
            st.rerun()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NAVBAR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def show_navbar():
    st.markdown(f"""
    <div class="navbar">
        <a href="?home=1" target="_self" class="nav-logo" title="Go to Home / Refresh">🛡️ DeepScan</a>
        <div class="nav-right">
            Logged in as: <span class="nav-username">@{st.session_state['username']}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Logout button (right-aligned)
    cols = st.columns([8, 1])
    with cols[1]:
        if st.button("Log Out", key="btn_logout"):
            st.session_state["authenticated"] = False
            st.session_state["username"] = ""
            st.session_state["full_name"] = ""
            st.session_state["analysis_done"] = False
            st.rerun()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HERO SECTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def show_hero():
    st.markdown("""
    <div class="hero-section">
        <div class="hero-title">Detect Deepfakes. Protect the Truth.</div>
        <div class="hero-sub">
            DeepScan uses a custom-trained CNN with Grad-CAM explainability to detect
            AI-generated face images — and explains why, powered by LLM reasoning.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Stat cards
    st.markdown("""
    <div class="stats-row">
        <div class="stat-card">
            <div class="stat-emoji">🎯</div>
            <div class="stat-value">98.68%</div>
            <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-card">
            <div class="stat-emoji">📈</div>
            <div class="stat-value">0.9878</div>
            <div class="stat-label">AUC-ROC</div>
        </div>
        <div class="stat-card">
            <div class="stat-emoji">🧠</div>
            <div class="stat-value">0.94</div>
            <div class="stat-label">F1 Score</div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ABOUT SECTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def show_about():
    with st.expander("ℹ️ About DeepScan"):
        st.markdown("""
DeepScan is an AI-powered deepfake detection system developed by **FakeProof Labs** at
**S-VYASA Deemed to be University**, under the **AIONAI Club**. It was built to address the
growing threat of AI-generated synthetic media — deepfakes — which are increasingly being
misused for identity fraud, misinformation, and digital deception.

Unlike black-box detectors, DeepScan goes beyond a simple yes/no verdict. It uses a
custom-built Convolutional Neural Network (CNN) trained on **140,000 real and AI-generated
face images**, achieving **98.68% test accuracy**. More importantly, it shows you exactly
why it made its decision — through **Grad-CAM heatmaps** that highlight the specific
facial regions that triggered the deepfake alert.

**Google Gemini** then reads those visual signals and provides a plain-English forensic
explanation: what artifacts were found, where they appeared, and what that means.

Built with **TensorFlow/Keras**, **Streamlit**, and the **Google Gemini API**.
Trained on Google Colab (T4 GPU). Evaluated with **AUC-ROC of 0.9878** and
**F1 score of 0.94** on a 20,000-image test set.
        """)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DETECTION SECTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def show_detection():
    st.markdown('<div class="section-header">🔍 Upload a Face Image for Analysis</div>',
                unsafe_allow_html=True)

    uploaded_file = st.file_uploader(
        "Drag and drop or click to upload",
        type=["jpg", "jpeg", "png"],
        key="file_upload",
        label_visibility="collapsed",
    )

    if uploaded_file:
        # Preview
        st.markdown('<div class="upload-preview">', unsafe_allow_html=True)
        st.image(uploaded_file, width=300)
        file_size_kb = uploaded_file.size / 1024
        st.markdown(
            f'<div class="upload-meta">📁 {uploaded_file.name} &nbsp;•&nbsp; {file_size_kb:.1f} KB</div>',
            unsafe_allow_html=True
        )
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("<div style='height:1rem'></div>", unsafe_allow_html=True)

        # Analyze button
        if st.button("🔍 Analyze Image", key="btn_analyze", use_container_width=True):
            run_analysis(uploaded_file)


def run_analysis(uploaded_file):
    with st.spinner("🔬 Running DeepScan analysis..."):
        # Load model
        model = load_model()

        # Preprocess
        img_array = preprocess_image(uploaded_file)

        # Predict
        pred = model.predict(img_array, verbose=0)[0][0]
        label = "REAL" if pred > 0.5 else "FAKE"
        confidence = float(pred) if pred > 0.5 else float(1 - pred)

        # Grad-CAM
        original_rgb, heatmap_img, overlay_img = generate_gradcam_images(img_array, model)

    # ─── VERDICT ────────────────────────────────────
    if label == "FAKE":
        st.markdown(f"""
        <div class="verdict-fake">
            <div class="verdict-label-fake">⚠️ DEEPFAKE DETECTED</div>
            <div class="verdict-conf verdict-conf-fake">{confidence:.1%}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="verdict-real">
            <div class="verdict-label-real">✅ AUTHENTIC IMAGE</div>
            <div class="verdict-conf verdict-conf-real">{confidence:.1%}</div>
        </div>
        """, unsafe_allow_html=True)

    # Confidence bar
    bar_class = "conf-bar-fake" if label == "FAKE" else "conf-bar-real"
    st.markdown(f'<div class="{bar_class}">', unsafe_allow_html=True)
    st.markdown(f"**Confidence: {confidence:.1%}**")
    st.progress(confidence)
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)

    # ─── HEATMAP DISPLAY ────────────────────────────
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        <div class="img-card">
            <div class="img-card-header">Original</div>
        </div>
        """, unsafe_allow_html=True)
        st.image(original_rgb, use_container_width=True)
        st.markdown(
            '<div class="img-card-caption">Raw uploaded face image</div>',
            unsafe_allow_html=True
        )

    with col2:
        st.markdown("""
        <div class="img-card">
            <div class="img-card-header">Activation Map</div>
        </div>
        """, unsafe_allow_html=True)
        st.image(heatmap_img, use_container_width=True)
        st.markdown(
            '<div class="img-card-caption">Grad-CAM heatmap — warm colours show regions the model focused on</div>',
            unsafe_allow_html=True
        )

    with col3:
        st.markdown(f"""
        <div class="img-card">
            <div class="img-card-header">{label} ({confidence:.1%} confident)</div>
        </div>
        """, unsafe_allow_html=True)
        st.image(overlay_img, use_container_width=True)
        st.markdown(
            '<div class="img-card-caption">Heatmap blended over the original for spatial context</div>',
            unsafe_allow_html=True
        )

    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)

    # ─── LLM FORENSIC ANALYSIS ─────────────────────
    show_llm_analysis(original_rgb, heatmap_img, overlay_img, label, confidence)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LLM ANALYSIS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def numpy_to_pil(img_array):
    return PILImage.fromarray(img_array.astype("uint8"))


def show_llm_analysis(original_rgb, heatmap_img, overlay_img, label, confidence):
    st.markdown('<div class="section-header">🧠 AI Forensic Analysis</div>',
                unsafe_allow_html=True)

    gemini_model, genai = init_gemini()

    pil_original = numpy_to_pil(original_rgb)
    pil_heatmap = numpy_to_pil(heatmap_img)
    pil_overlay = numpy_to_pil(overlay_img)

    user_prompt = f"""
Please analyze these three images (Original, Heatmap, Overlay) and provide a detailed explanation of what the heatmap indicates about the authenticity of the face.

The images are provided in this order:
  - Image 1: The original face photo
  - Image 2: Raw Grad-CAM heatmap (warm = high activation)
  - Image 3: Heatmap overlaid on the original face

Additional context from the CNN classifier:
  Verdict    : {label}
  Confidence : {confidence:.1%}

Please factor this into your analysis but form your own visual assessment from the images. Follow the four-section format specified in your instructions exactly.
"""

    with st.spinner("🤖 DeepScan AI is analyzing the image..."):
        try:
            response = gemini_model.generate_content(
                [
                    user_prompt,
                    pil_original,
                    pil_heatmap,
                    pil_overlay,
                ],
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=2500,
                ),
            )
            llm_output = response.text
            
            # Convert critical markdown to basic HTML so the custom div renders it properly
            llm_output = llm_output.replace('\n', '<br>')
            llm_output = re.sub(r'\*\*(.*?)\*\*', r'<strong style="color: var(--accent) !important; font-size: 1.05rem;">\1</strong>', llm_output)

        except genai.types.BlockedPromptException:
            llm_output = (
                "⚠️ The request was blocked by Gemini's safety filters.<br><br>"
                "This may occur if the uploaded image contains content "
                "that violates usage policies. Please try a different image."
            )
        except Exception as e:
            llm_output = (
                f"❌ Gemini API error: {type(e).__name__}: {e}<br><br>"
                "Please verify your API key in .streamlit/secrets.toml."
            )

    st.markdown(
        f'<div class="llm-card" style="word-wrap: break-word; height: auto;">{llm_output}</div>',
        unsafe_allow_html=True,
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN APP FLOW
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def main():
    if not st.session_state["authenticated"]:
        show_auth_modal()
    else:
        show_navbar()
        show_hero()
        show_about()
        st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
        show_detection()
        # Footer
        st.markdown("""
        <div style="text-align:center; padding: 3rem 0 1rem; color: var(--text-secondary) !important;
                    font-size: 0.8rem; border-top: 1px solid var(--border); margin-top: 3rem;">
            🛡️ DeepScan v1.0 &nbsp;•&nbsp; Built by FakeProof Labs &nbsp;•&nbsp;
            S-VYASA University &nbsp;•&nbsp; AIONAI Club &nbsp;•&nbsp; 2025
        </div>
        """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
