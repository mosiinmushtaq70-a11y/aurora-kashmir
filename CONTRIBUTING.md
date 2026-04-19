# Contributing to AuroraLens 🔭

Thank you for your interest in contributing to AuroraLens! This project aims to democratize space weather data through high-precision machine learning.

## 🚀 How to Contribute

### 1. Reporting Bugs
- Use the **GitHub Issue Tracker**.
- Provide a clear title and description.
- Include steps to reproduce and environment details.

### 2. Suggesting Enhancements
- Open an issue labeled `enhancement`.
- Describe the feature and its value to the aurora observer community.

### 3. Pull Requests
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 💻 Local Setup

### Prerequisites
- Node.js 20+
- Python 3.10+
- pip (Python package manager)

### Installation Steps
1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/aurora.git
   cd aurora
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   uvicorn main:app --reload
   ```

### Environment Variables
Copy `.env.example` to `.env` in the root directory. You will need:
- `NASA_API_KEY` (Free from api.nasa.gov)
- `NEXT_PUBLIC_MAPTILER_KEY` (Free from Maptiler)
See `.env.example` for the full list of optional and required keys.

## 🧪 PR Checklist
Before submitting a PR, please ensure:
- [ ] `npm run build` completes with zero errors
- [ ] `npm run lint` passes
- [ ] You have tested your changes locally
- [ ] No API keys or secrets are hardcoded

## 🏗️ Technical Contribution Areas
- **ML Model**: Improving XGBoost weights or adding new training features.
- **Data Pipeline**: Integrating new telemetry sources (e.g., GOES-16).
- **Frontend**: Enhancing the glassmorphic HUD or improving accessibility.
- **Hotspots**: Adding high-precision coordinates for new aurora viewing nodes.

---
By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
