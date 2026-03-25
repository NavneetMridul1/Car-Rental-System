# Car Rental System

Full-stack car rental application.

## Tech Stack

* Backend: Node.js, Express, MySQL
* Frontend: HTML, CSS, JavaScript

---

## Project Structure

```
backend/
  src/
  package.json

frontend/
  *.html
  css/
  js/

database.sql
README.md
```

---

## Setup Instructions

### 1. Database

Import the database:

```
mysql -u <username> -p < database.sql
```

---

### 2. Backend Setup

Create `.env` file inside `backend/`:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

Install dependencies and start server:

```
cd backend
npm install
npm start
```

---

### 3. Frontend

Open any HTML file (e.g. `index.html`) in browser.

---

## API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

### Cars

* GET `/api/cars`
* POST `/api/cars`
* PUT `/api/cars/:id`

### Bookings

* POST `/api/bookings`
* GET `/api/agency/bookings`

---

## Features

* User authentication (JWT)
* Role-based access (Customer / Agency)
* Car listing and management
* Booking system with validation
* Prevents overlapping bookings
* Secure password handling (bcrypt)

---

## Notes

* Use the provided `database.sql` to recreate the database
* Ensure environment variables are set correctly before running the backend
