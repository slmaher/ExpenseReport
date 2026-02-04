# expense-reports

## Project Description

**Expense Reports** is a full-stack web application designed to streamline the process of managing employee expense reports. The system enables employees to create and submit monthly expense reports while providing administrators with the tools to review, approve, or reject these submissions.

### Key Features

- **Employee Dashboard**: Allows employees to log and submit their monthly expense reports
- **Admin Dashboard**: Provides administrators with a comprehensive interface to review, filter, and manage expense reports
- **Authentication System**: Secure user authentication and authorization
- **Multi-language Support**: Supports both English and Arabic languages
- **Theme Support**: Light and dark theme options
- **Status Tracking**: Track the status of expense reports (pending, approved, rejected)

### Technology Stack

- **Frontend**: React + Vite with modern UI components
- **Backend**: FastAPI (Python) with RESTful API architecture
- **Database**: PostgreSQL (configured via database models)
- **State Management**: React Context API for authentication, theme, and language

---

A system that allows employees to log their monthly expense reports.

---

## Prerequisites

* **Python 3.8+**: Used for the FastAPI backend.

* **Pipenv**: A Python dependency and virtual environment manager.

* **Node.js & npm**: Used for the React frontend.

---

## Getting Started

Follow these steps to get both the backend and frontend servers running.

### 1. Backend Setup

This part of the project is in the `backend/` directory.

1. Navigate to the main project directory. If you are already there, skip this step.

   ```
   cd expense-reports/
   ```

2. Navigate into the `backend` directory.

   ```
   cd backend/
   ```

3. Install the required Python dependencies using Pipenv. This will create a virtual environment and install FastAPI and Uvicorn.

   ```
   pipenv install
   ```

4. Activate the venv:

   ```
   pipenv shell
   ```

5. Run the backend server. The `--reload` flag will automatically restart the server on code changes.

   ```
   uvicorn main:app --reload
   ```

The backend should now be running and accessible at `http://localhost:8000`.

### 2. Frontend Setup

This part of the project is in the `frontend/` directory.

1. Open a new terminal session and navigate to the project's root.

   ```
   cd expense-reports/
   ```

2. Navigate into the `frontend` directory.

   ```
   cd frontend/
   ```

3. Install the required Node.js dependencies.

   ```
   npm install
   ```

4. Run the frontend development server.

   ```
   npm run dev
   ```

The frontend should now be running and accessible at `http://localhost:5173`.


