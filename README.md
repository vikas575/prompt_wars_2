# CivicIQ: Election Process Education Assistant 🗳️✨

**CivicIQ** is a high-fidelity, interactive web application designed to empower citizens with the knowledge they need to participate confidently in the democratic process. Built for the **Prompt Wars 2 Hackathon**, this project focuses on accessibility, multilingual support, and a premium user experience.

## 🌟 Key Features

-   **Interactive Election Timeline**: Follow every stage of the election process, from nomination filing to government formation, across India, USA, and UK.
-   **Myth vs. Fact Database**: Debunk common misconceptions with verified facts and detailed explanations.
-   **Civic Readiness Quiz**: Test your knowledge and receive a personalized "Civic Readiness Score" with detailed feedback.
-   **Polling Station Locator (Demo Mode)**: A high-fidelity simulated map that allows users to find nearby booths in a beautiful, glassmorphic interface.
-   **Accessibility First**:
    -   **Text-to-Speech (TTS)**: Listen to any section with a single click.
    -   **Multilingual Support**: Available in 8+ languages including English, Hindi, Spanish, French, and more.
    -   **Keyboard Accessible**: Full WCAG 2.1 compliance with skip links and semantic HTML.
-   **Hybrid Demo Mode**: Automatically detects missing API keys and provides simulated data for a seamless demonstration experience.

## 🚀 Tech Stack

-   **Frontend**: React 18, Vite, TypeScript
-   **State Management**: Zustand
-   **Styling**: Custom Vanilla CSS (Design System approach)
-   **Backend (Simulated)**: Firebase Auth & Firestore
-   **APIs (Simulated Fallback)**: Google Maps, Google Translate, Google TTS

## 🛠️ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/vikas575/prompt_wars_2.git
    cd prompt_wars_2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run locally**:
    ```bash
    npm run dev
    ```

4.  **Demo Mode**: The application will automatically run in "Full Feature Demo Mode" if real API keys are not provided in a `.env` file. To use real APIs, copy `.env.example` to `.env` and fill in your Google Cloud and Firebase credentials.

## 📐 Architecture

-   **Modular Feature Structure**: Features like `quiz`, `map`, and `timeline` are isolated for maintainability.
-   **Resilient Service Layer**: All external API calls include robust fallbacks to ensure the app never crashes during a live demo.
-   **Global State**: Centralized `appStore` manages user preferences and session data across the entire application.

---
Built with 💙 for civic empowerment.
