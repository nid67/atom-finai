# 🌌 Atom FinAI: AI-Powered Financial Health & Wealth Copilot

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite)](https://vite.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-FFCA28.svg?logo=firebase)](https://firebase.google.com/)

**Atom FinAI** is a premium, state-of-the-art wealth management application designed to act as your personalized financial advisor. Built with a sleek, glassmorphic dark interface, Atom integrates local rule-evaluation engines, complex mathematical trend analyses, and modern artificial intelligence to deliver deep behavioral insights—all while maintaining ironclad privacy compliance.

---

## ✨ Key Features & Capabilities

### 1. 📊 Unified Financial Dashboard
- **Real-Time Wealth Monitoring**: Instantly view net worth, monthly spending aggregates, and income statistics.
- **Micro-Metric Summaries**: Track Month-over-Month (MoM) spending trajectories and real-time savings rate percentages.
- **Smart System Alerts**: Immediate display of high-priority financial notifications and automated recommendations.

### 2. 🔍 Analytical Subscription Pattern-Scanner
Unlike traditional tools that require sharing banking credentials, Atom protects your privacy by scanning your manual logs and receipt data 100% locally.
* **Instant Auto-Detection**: Recognizes prominent subscription merchants (`Netflix`, `Spotify`, `iCloud`, `YouTube Premium`, `Disney+`, `Amazon Prime`, `ChatGPT Plus`, `Canva`, `GitHub Copilot`, `Adobe Creative Cloud`, `Broadband`, `Rent`, etc.) even from a single transaction log.
* **Smart Day-Difference Scanning**: Automatically clusters unrecognized recurring outflows using a statistical window parser (grouping identical amounts from matching merchants separated by **25–35 days** for monthly subscriptions, or **12–16 days** for semi-monthly services).
* **Aggregated Outflow Projections**: Quantifies monthly recurring burdens and computes an estimated annual cash leak.

### 3. 🧠 Smart Rule Engine & Alerts
* **Budget Limits Monitoring**: Evaluates category-specific budgets in real-time, outputting critical warning notifications at **85% capacity** and severe alert markers at **100% capacity**.
* **Deficit Spends Detection**: Flags months where expenditures surpass incoming cash flow, immediately calculating the deficit percentage.
* **Volatility Analysis**: Automatically triggers a high-volatility warning if current-month discretionary expenditures spike by **40% or more** compared to the previous month.
* **Actionable Savings Suggestions**: Provides tailored behavioral instructions based on evaluated system rules.

### 4. 📈 Automated Profiling & Financial Personas
Atom dynamically computes your financial psychology index in the background:
- **Financial Health Score**: An automated rating from `1` to `100` formulated by combining savings rates, budget adherence, and investment/savings commitment.
- **Financial Personality Archetype**: Custom profiling algorithms classify users into distinct categories:
  - **Balanced Planner**: Maintain stable savings and disciplined budgets.
  - **Impulsive Spender**: High category volatility and budget overruns.
  - **Disciplined Saver**: High savings rates (>25%) and zero budget alerts.
  - **Aggressive Investor**: High allocation towards investment categories and healthy liquidity.

### 5. 💬 Interactive AI Financial Coach
- **Context-Aware Assistance**: An interactive conversational AI assistant that directly utilizes your real-time financial stats, personality archetype, current month budgets, savings goals, and transaction metrics.
- **Tax & Advisory Strategy**: Get immediate AI feedback on tax-saving mechanisms, debt reduction plans, and investment allocation based on your risk profile.

### 6. 🎯 Savings Goals & Milestone Tracker
- **Target Deadlines**: Log interactive milestones with specified dates, descriptions, and desired amounts.
- **Milestone Nearing Warnings**: Receives active reminders when deadlines are less than 45 days away and progress is under 80%.

### 7. 🤝 Household Sharing & Collaboration
- Synchronize budgets and expenses with family members or household partners for collaborative wealth building.

---

## 🔮 Upcoming Roadmap (Upcoming Features)

We are actively expanding the analytical power of Atom FinAI. The upcoming releases will include:

1. **📷 AI-Powered Receipt OCR Integration**
   - Direct camera/image upload of receipts to automatically extract merchant, date, tax, and itemized transaction entries, completely removing manual entry overhead.
2. **📂 Bank Statement Parser (CSV / OFX)**
   - Upload bank statement spreadsheets to instantly ingest historical transaction data with automatic category mapping.
3. **🔮 Predictive Cash Flow Forecasting**
   - Machine learning algorithms to forecast future bank account balances, flag future deficit periods, and warn about upcoming bills before they happen.
4. **📊 Investment Portfolio Tracking**
   - Connect live stock, mutual fund, and crypto market trackers to compute a comprehensive net worth in one unified portal.
5. **🏦 Micro-Savings Auto-Roundups**
   - Virtual transaction rounding (saving the change from every transaction) to automatically feed dedicated investment vaults.

---

## 🛠️ Technical Stack & Architecture

- **Core**: React 19 (Hooks, Context, write batches), TypeScript, Vite 8.
- **Styles**: TailwindCSS v4 (sleek dark mode glassmorphism, responsive navigation).
- **Backend / Synchronization**: Firebase v12 (Firestore real-time listeners, Firebase Authentication, Cloud security rules).
- **Icons & Animations**: Lucide React, Canvas Confetti.

---

## ⚙️ Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- NPM or PNPM

### 1. Clone the repository
```bash
git clone https://github.com/nid67/atom-finai.git
cd atom-finai
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security & Privacy Policy
* Atom operates on a zero-trust architecture regarding your bank account logins. We never ask for your routing number, passwords, or credentials.
* Data is stored securely in Firebase and syncs in real-time across your authorized devices.

---

*Made with ❤️ for financial freedom.*
