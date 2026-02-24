# Guided Component Architect

An agentic pipeline that transforms natural language descriptions into validated, design-system-compliant Angular components using **Kimi K2** (via Groq API) as the code generation backbone.

Now featuring a **Streamlit Web Dashboard** for real-time visualization and multi-turn editing.

```
User Prompt → [Generator] → [Linter-Agent] → Valid? → Output
                                   ↓ No
                           [Self-Correction] → [Generator again]
                           (up to 3 retries)
```

---

## Agentic Loop Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Input                        │
│         "A login card with glassmorphism"           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Sanitization Layer                     │
│   Strip prompt injection patterns, truncate input   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│        Generator (Groq / Kimi K2 API Call #1)       │
│  System prompt: "output raw code only"              │
│  Context: design-system.json tokens injected        │
│  User data: sanitized component description         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Linter-Agent (Validator)               │
│  ✓ Syntax check: balanced braces/parens/backticks   │
│  ✓ No markdown fences leaked into output            │
│  ✓ No hard-coded hex/rgb outside design system      │
│  ✓ Angular structure: @Component, export class      │
└──────────────┬───────────────────┬─────────────────┘
               │ Valid             │ Invalid
               ▼                   ▼
┌──────────────────┐  ┌────────────────────────────────┐
│   Final Output   │  │   Self-Correction (retry)      │
│  (component.ts)  │  │   Re-prompt with error logs    │
└──────────────────┘  │   "Fix these N errors: ..."    │
                      └──────────────┬─────────────────┘
                                     │ up to MAX_RETRIES=3
                                     ▼
                            Back to Generator
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- A [Groq API key](https://console.groq.com/keys)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/guided-component-architect
   cd guided-component-architect
   ```

2. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate   # On Windows
   source venv/bin/activate  # On Unix/macOS
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```text
   GROQ_API_KEY=gsk_your_key_here
   ```

---

## Usage

### 🌐 Web Dashboard (Recommended)

The easiest way to use the Architect is through the Streamlit dashboard. It provides real-time logs of the agentic loop and a chat-like interface for multi-turn editing.

```bash
streamlit run app.py
```

### 💻 CLI Interface

#### Initial Generation
```bash
# Interactive mode
python src/pipeline.py

# One-liner with output file
python src/pipeline.py "A dark dashboard card showing user stats" --output output/stats-card.component.ts
```

#### Multi-Turn Editing (Session)
```bash
python src/session.py
```

```
> Describe the component: A login card with glassmorphism effect
  [generates component, validates, saves]

> Follow-up edit: Make the button rounded with a glow effect
  [applies edit, re-validates]

> Follow-up edit: Add a "forgot password" link
  [applies edit, re-validates]

> quit
```

### Run Tests

```bash
pytest tests/ -v
```

---

## Project Structure

```
guided-component-architect/
├── app.py                          # Streamlit Web Frontend
├── design-system.json              # Single source of truth for all design tokens
├── requirements.txt                # Python dependencies
├── .env                            # API Key configuration (gitignored)
├── .gitignore                      # Git exclusion rules
├── src/
│   ├── output/                     # Generated components directory
│   ├── pipeline.py                 # Core agentic loop (generate → validate → correct)
│   └── session.py                  # Multi-turn editing session manager
└── tests/
    └── test_validator.py           # Unit tests for the Linter-Agent

```

---

## Design System

All tokens live in `design-system.json`. The validator rejects any component using colors outside this file.

| Token | Value |
|-------|-------|
| primary | `#6366f1` |
| primary-dark | `#4f46e5` |
| background | `#0f172a` |
| surface | `#1e293b` |
| text-primary | `#f8fafc` |
| border-radius | `8px` |
| font-family | `'Inter', sans-serif` |
| glass-bg | `rgba(255, 255, 255, 0.08)` |
| shadow-glow | `0 0 20px rgba(99,102,241,0.4)` |

To extend the design system, add tokens to `design-system.json` — the validator and generator pick them up automatically.

---

## Validation Rules (Linter-Agent)

The validator runs **regex + pattern matching** checks to keep the system fast and avoid TypeScript toolchain dependencies:

| Check | Method | Error Example |
|-------|--------|---------------|
| Balanced braces `{}` | Char count | `Unbalanced braces — 5 '{' vs 4 '}'` |
| Balanced parens `()` | Char count | `Unbalanced parentheses` |
| Balanced backticks | Char count % 2 | `Unclosed template literal` |
| Markdown fences | String search | `Code contains markdown fences` |
| Conversational prefix | Line prefix match | `Response starts with conversational text` |
| Unauthorized hex color | Regex `#[0-9a-f]{3,8}` | `Hard-coded color '#ff0000' not in design system` |
| Unauthorized rgba | Regex + ds lookup | `Non-system color value 'rgba(...)' detected` |
| `@Component` present | String search | `Missing @Component decorator` |
| `export class` present | String search | `Missing exported class declaration` |

---

## Prompt Engineering Decisions

- **System Prompt Isolation**: Instructions delivered via the `system` role to prevent role confusion.
- **Input Framing as Data**: User descriptions are triple-quoted and explicitly labeled as data.
- **Self-Correction Loop**: On failure, the model receives its own broken code and the specific error log to reason about the fix.

---

## Assumptions

- Angular and Tailwind are pre-installed in the target project.
- The output is Angular standalone components (Angular 14+).
- The validator uses regex for speed and portability (no Node.js required at runtime).

---

## Extending the System

- **Add a new validation rule:** Modify `src/pipeline.py` and add a check to `validate_component()`.
- **Add new design tokens:** Edit `design-system.json`.
- **Change the model:** Update `MODEL` in `src/pipeline.py`.
