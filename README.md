# 🦈 Shark Tank AI Simulator (PromptWars Hackathon)

> Built solo during **PromptWars** (by Hack2Skill) hosted at **Pondicherry University**—a high-intensity 8-hour vibe coding and prompt engineering marathon.

---

## 🎯 The Problem Statement

Every founder thinks their idea is bulletproof. Friends are too polite, and real venture capitalists are nearly impossible to get a meeting with. This created a massive gap: **How do you get unvarnished, niche-specific stress testing before stepping into a real investor room?**

The challenge was to build an automated AI investor panel that tests a startup idea the way real investors do—stripping away generic templates and delivering brutal, context-aware interrogation.

---

## 💡 How It Was Solved

Instead of relying on lazy, pre-written question arrays, this simulator leverages the **Google Gen AI SDK (`@google/genai`)** and **`gemini-2.5-flash`** to dynamically generate niche-specific grilling based on real-time user inputs.

### ⚡ Technical Architecture Highlights:
1. **Dynamic System Instructions:** The backend injects the user's custom startup details (`startupName`, `startupNiche`, `startupPitch`) directly into the system context. Pitch a quick commerce app? The AI zeroes in on burn rate and dark-store density. Pitch a medical robot? It attacks regulatory liabilities. 
2. **Multi-Turn Evasion Detection:** Utilizing `ai.chats.create()`, the backend maintains full conversation history across turns. If a founder dodges a tough metric, the panel catches the evasion and aggressively counter-attacks.
3. **Structured JSON Output:** Enforces a strict `responseSchema` to output clean, predictable keys (`shark_name`, `reaction_type`, and `message_text`), making state synchronization with the frontend seamless.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express, Cors, Dotenv
* **AI Engine:** Google Gen AI SDK (`@google/genai`), `gemini-2.5-flash`
* **Data Format:** Structured JSON Schema validation

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js installed on your machine
* A free Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/shark-tank-simulator.git](https://github.com/your-username/shark-tank-simulator.git)
cd shark-tank-simulator
