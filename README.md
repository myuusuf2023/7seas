# 7-Seas Suites Project Management System

A comprehensive web-based admin system to manage the 7-Seas Suites investment project with multiple investors and staged payments.

## Features

- **Admin-Only Access** - Secure JWT-based authentication
- **Investor Management** - Track investor profiles, KYC, and share positions (LP/GP)
- **Payment Tracking** - Record staged payments (entry fees + quarterly)
- **Document Management** - Upload and organize contracts, KYC, receipts, reports
- **Financial Reporting** - Generate PDF/Excel reports and investor statements
- **Dashboard** - Beautiful Material UI dashboard with real-time KPIs and visualizations

## Tech Stack

### Backend
- Django 4.2 + Django REST Framework
- PostgreSQL 15
- JWT Authentication (Simple JWT)
- PDF Generation (ReportLab)
- Excel Generation (OpenPyXL)

### Frontend
- React 18
- Material UI v5
- Recharts (Data Visualization)
- Axios (API Client)
- React Router v6

### Deployment
- Docker + Docker Compose
- Gunicorn (Production)
- Nginx (Production)

## Getting Started

### Prerequisites
- Docker Desktop installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 7seas
   ```

2. **Start the application with Docker**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Django backend on port 8000
   - React frontend on port 3000

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

4. **Default Admin Credentials**
   - Username: `admin`
   - Password: `admin123`

### Development

#### Backend Development

```bash
# Access backend container
docker-compose exec backend bash

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
pytest
```

#### Frontend Development

```bash
# Access frontend container
docker-compose exec frontend sh

# Install new packages
npm install <package-name>

# Run tests
npm test
```

## Project Structure

```
7seas/
├── backend/
│   ├── config/              # Django settings
│   ├── apps/
│   │   ├── authentication/  # User & JWT auth
│   │   ├── investors/       # Investor CRUD
│   │   ├── payments/        # Payment tracking
│   │   ├── documents/       # File uploads
│   │   ├── reports/         # PDF/Excel generation
│   │   └── dashboard/       # Dashboard APIs
│   └── media/               # Uploaded files
├── frontend/
│   └── src/
│       ├── components/      # React components
│       ├── services/        # API clients
│       ├── theme/           # Material UI theme
│       └── contexts/        # React contexts
├── docker/                  # Dockerfiles
└── docker-compose.yml       # Container orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Get current user

### Investors
- `GET /api/investors/` - List investors
- `POST /api/investors/` - Create investor
- `GET /api/investors/{id}/` - Get investor
- `PUT /api/investors/{id}/` - Update investor
- `DELETE /api/investors/{id}/` - Delete investor

### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `POST /api/payments/{id}/verify/` - Verify payment

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/download/` - Download document

### Dashboard
- `GET /api/dashboard/overview/` - KPI metrics
- `GET /api/dashboard/collections-timeline/` - Chart data
- `GET /api/dashboard/overdue-investors/` - Overdue list

### Reports
- `GET /api/reports/investor-statement/{id}/` - PDF statement
- `GET /api/reports/outstanding-balances/` - Excel report

## Design Theme

The application uses a sophisticated dark theme matching the 7-Seas Suites branding:

- **Primary Color**: Dark Navy / Deep Teal (#1B4965)
- **Accent Color**: Gold / Warm Bronze (#C9A961)
- **Background**: Very dark (#0A1929)
- **Cards**: Dark surface (#1B2937)
- **Text**: White with light grey

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://sevenseas_user:sevenseas_password@db:5432/sevenseas_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=7-Seas Suites Management
```

## Security

- JWT authentication with 1-hour access tokens
- Token rotation and blacklisting
- CORS protection
- File upload validation (50MB limit)
- Role-based permissions
- HTTPS in production
- Secure cookies

## Testing

### Backend Tests
```bash
cd backend
pytest apps/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## License

Proprietary - 7-Seas Suites

## Support

For support, please contact the development team.
