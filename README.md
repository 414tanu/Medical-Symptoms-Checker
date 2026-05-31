# AI Medical Symptom Checker 🏥

An AI-powered medical symptom checker web application tailored for real-world usage, specifically designed to assist rural populations in India. The application leverages Google's Gemini AI to analyze symptoms and provide preliminary diagnoses. It also integrates geolocation services to help users find nearby clinics and hospitals, and allows for seamless appointment booking.

## ✨ Features

- **🤖 AI Symptom Diagnosis**: Uses Gemini AI to analyze user-reported symptoms and provide potential medical conditions and advice.
- **🗺️ Geolocation Clinics**: Interactive map integration to locate nearby hospitals and clinics based on the user's current location.
- **📅 Appointment Booking**: Built-in system to book and manage appointments with healthcare providers.
- **🌐 Multilingual Support (i18n)**: Supports multiple languages, including Hindi, to cater to rural Indian demographics.
- **📱 Mobile-First & PWA**: Responsive design optimized for mobile devices, with Progressive Web App (PWA) capabilities for offline access and reminders.
- **🔐 User Dashboard**: Secure authentication and personalized dashboards to track medical history, symptoms, and upcoming appointments.

## 🏗️ Architecture

This project is built using a modern full-stack architecture:

- **Frontend**: React.js with Tailwind CSS for rapid and responsive UI development. Maps integrated via `@react-google-maps/api`. Routing handled by `react-router-dom`.
- **Backend**: Django (Python) REST API handling the core business logic, user authentication, and AI integration.
- **Database**: PostgreSQL (Production) / SQLite (Development) for storing user data, hospital info, and appointments.

## 🚀 Workflow & Project Structure

The repository is structured into two main parts:

- `/frontend`: Contains the React application.
  - `src/components`: Reusable UI components (SymptomForm, ClinicMap, etc.)
  - `src/pages`: Main application views (Home, Hospitals, Appointments, Dashboard)
- `/backend`: Contains the Django application.
  - `symptoms`: Manages AI symptom analysis logic.
  - `hospitals`: Manages hospital data and geolocation queries.
  - `appointments`: Handles booking and scheduling logic.
  - `users`: Manages user authentication and profiles.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- Google Maps API Key
- Gemini AI API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (`.env` file).
5. Run database migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env` file).
4. Start the development server:
   ```bash
   npm start
   ```

## 📝 Roadmap
- [x] Initial Django setup and React integration.
- [x] Core frontend components (SymptomForm, AnalysisResults, ClinicMap, AppointmentBooker).
- [ ] Implement Hindi translations (i18n).
- [ ] Configure PWA service workers for offline support.
- [ ] Seed rural clinics database for Bihar/UP.
- [ ] Production deployment to GCP/Docker.

## 👨‍💻 Developed By
**Tanuj**
- GitHub: [414tanu](https://github.com/414tanu)
- Email: tanujbrt@gmail.com

*Built with ❤️ to fight hunger and reduce global food waste.*