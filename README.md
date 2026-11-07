# Mini CRM (Client Lead Management System)

A simple and lightweight Lead Management CRM for capturing website inquiries and managing customer leads.

## Features

- **Public Contact Form**: Visitors submit inquiries (name, email, message) which instantly become leads with `NEW` status.
- **Admin Dashboard**: Real-time stats strip (Total, New, Contacted, Converted leads).
- **Lead Filtering & Search**: Instant keyword search by name or email and filtering by status.
- **Quick Status Updates**: Inline status updates (`NEW`, `CONTACTED`, `CONVERTED`) reflecting immediately.
- **Lead Details & Notes**: View individual lead info, add interaction notes, and assign follow-up dates.
- **Security**: HTTP Basic authentication for admin endpoints with BCrypt password hashing.

## Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, Validation, MySQL Driver, Lombok, Maven.
- **Frontend**: React 18, Vite, React Router DOM, Plain CSS, Fetch API.
- **Database**: MySQL (`crm_db`), automatic table creation via JPA Hibernate (`ddl-auto=update`).

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `DB_URL` | JDBC Connection String | `jdbc:mysql://localhost:3306/crm_db?createDatabaseIfNotExist=true` |
| `DB_USER` | MySQL Username | `root` |
| `DB_PASSWORD` | MySQL Password | `your_mysql_password` |
| `ADMIN_USER` | Admin Login Username | `admin` |
| `ADMIN_PASSWORD` | Admin Login Password | `admin123` |

## Setup Instructions

### 1. Database Setup
Make sure MySQL is running on port 3306. The database `crm_db` will be auto-created if it does not exist, or you can create it manually:
```sql
CREATE DATABASE IF NOT EXISTS crm_db;
```

### 2. Backend Setup & Run
Navigate to the `server` directory and run:
```bash
cd server
mvn spring-boot:run
```
The server starts at `http://localhost:8080`.

### 3. Frontend Setup & Run
In another terminal, navigate to the `client` directory and run:
```bash
cd client
npm install
npm run dev
```
The client starts at `http://localhost:5173`.

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/leads` | Public | Create new lead with status `NEW` |
| `GET` | `/api/leads?search=&status=` | Admin | List leads (newest first) with search/filter |
| `GET` | `/api/leads/{id}` | Admin | Get details of a single lead |
| `PUT` | `/api/leads/{id}/status` | Admin | Update status (`NEW`, `CONTACTED`, `CONVERTED`) |
| `DELETE` | `/api/leads/{id}` | Admin | Delete lead and associated notes |
| `GET` | `/api/leads/{id}/notes` | Admin | List notes for a lead |
| `POST` | `/api/leads/{id}/notes` | Admin | Add a note with optional `followUpDate` |
| `GET` | `/api/stats` | Admin | Lead counters (total, new, contacted, converted) |

## Security Note

HTTP Basic authentication sends credentials encoded in base64 on every request. In production environments, always serve the application over HTTPS (TLS/SSL) to protect credentials and data in transit.
