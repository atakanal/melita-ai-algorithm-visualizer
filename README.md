# Melita: AI Algorithm Visualization & Analysis Engine

[![GitHub stars](https://img.shields.io/github/stars/atakanal/melita-ai-algorithm-visualizer?style=social)](https://github.com/atakanal/melita-ai-algorithm-visualizer)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Hackathon Status](https://img.shields.io/badge/Kaggle_Hackathon-Submitted-d946ef)](YOUR_KAGGLE_SUBMISSION_LINK)

## 🧠 Project Overview: The Cyberpunk Code Analyst

Melita is an advanced AI Algorithm Assistant powered by **Gemini 3 Pro**, engineered to analyze code complexity and flow, supporting input via **code snippets or image screenshots**.

Going beyond a standard code checker, Melita engages the user through a custom **Cyberpunk**-themed interface (built with Gradio). It instantly transforms complex code blocks into visual flowcharts, calculates time/space complexity, and provides optimization tips. It is designed to be the ultimate companion for developers, students, and algorithm enthusiasts.

### ⚡ Key Features

* **Multimodal Input (Vision):** Capable of extracting raw code from **screenshots or images** using Gemini's vision capabilities, alongside direct text input.
* **Mermaid Diagram Generation:** Automatically visualizes the logical flow of the analyzed code by generating **Mermaid.js** syntax (covering function calls, loops, conditional branches, etc.).
* **Deep Algorithmic Analysis:** Determines the **Time Complexity** and **Space Complexity** of the code snippet in Big O notation (e.g., $O(n \log n)$) and provides detailed markdown explanations.
* **Custom UI (Gradio):** Features a unique, high-contrast, dark-mode interface that reflects Melita's sharp, analytical personality.

---

## ⚙️ Tech Stack & Architecture

Melita leverages Google's cutting-edge models for high performance and sophisticated multimodal capabilities.

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Google Gemini 3 Pro** | Core analysis engine, generating JSON/Mermaid output. | Latest
| **Python** | Backend logic, API interaction, and custom processing. | 3.10+
| **Gradio** | Custom UI framework, hosting the unique Cyberpunk user interface. | Latest
| **Mermaid.ink** | External service used to render the Mermaid code into visual diagrams (PNG/SVG). | External

---

## 💻 Setup and Execution

Follow these steps to run the Melita AI Engine locally or within your Kaggle environment.

### Prerequisites

1.  Python 3.10+
2.  A valid **Google Gemini API Key**.

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/Melita-AI.git](https://github.com/YOUR_GITHUB_USERNAME/Melita-AI.git)
    cd Melita-AI
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    # (or: pip install gradio google-generativeai pandas pillow requests)
    ```

3.  **Set Your API Key (Security First):**
    The API key is **not** hardcoded in the repository. Set it as an environment variable to run the application.
    ```bash
    export GEMINI_API_KEY="YOUR_API_KEY"
    ```

4.  **Launch the Application:**
    ```bash
    python app.py
    # or run the final cell in the Kaggle Notebook.
    ```
    Melita will be accessible via a local or shared public link.

---

## 🖼️ Demo & Submission Details

This project is submitted to the Kaggle Gemini Hackathon, demonstrating superior prompt engineering combined with practical software integration.

* **[INSERT SCREENSHOT OF YOUR CYBERPUNK MELITA UI HERE]**
    *(Showcases the custom dark theme and two-column layout)*
* **[INSERT SCREENSHOT OF A MERMAID DIAGRAM OUTPUT HERE]**
    *(Highlights the analytical capability)*

### Submission Links (For the Judges)

| Description | Link |
| :--- | :--- |
| **🚀 AI Studio Link (Core Prompt Logic)** | https://ai.studio/apps/drive/1eI3OFnf8hbrbzg6QoQlsoRB7uf_PymQL?fullscreenApplet=true |
| **💻 Source Code Repository** | This Repository: `https://github.com/atakanal/melita-ai-algorithm-visualizer` |
| **🎥 Video Demonstration** | ['coming soon' (Highly Recommended) |

---

## 🤝 Contribution

Melita is an open-source project. Feel free to submit pull requests, report bugs, or suggest new features to enhance our AI code assistant.

*Created for the Kaggle Gemini Hackathon.*
