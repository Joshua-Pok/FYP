# Go Backend API

A robust Go backend API built with Gin framework, PostgreSQL database, and JWT authentication.

## Features

- **Authentication**: JWT-based user authentication with registration and login
- **User Management**: Complete CRUD operations for user profiles
- **Database**: PostgreSQL with proper indexing and migrations
- **Security**: Password hashing, input validation, CORS, and rate limiting
- **API Documentation**: RESTful API with consistent response format
- **Error Handling**: Comprehensive error handling and logging

## Project Structure

```
backend/
├── config/          # Configuration management
├── database/        # Database connection and utilities
├── handlers/        # HTTP request handlers
├── middleware/      # HTTP middleware (auth, CORS, etc.)
├── migrations/      # Database migration files
├── models/          # Data models and structs
├── routes/          # Route definitions
├── utils/           # Utility functions
├── main.go          # Application entry point
├── go.mod           # Go module file
├── env.example      # Environment variables template
└── README.md        # This file
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Git

## Setup Instructions

### 1. Clone and Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
go mod tidy
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your database credentials and other settings.

### 4. Set Up Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE fyp_db;
```

2. Run the migration:
```bash
psql -d fyp_db -f migrations/001_create_users_table.sql
```

### 5. Run the Application

```bash
go run main.go
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

### User Management (Protected Routes)

All user routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get User Profile
```
GET /api/users/profile
```

#### Update User Profile
```
PUT /api/users/profile
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com"
}
```

#### Get User by ID
```
GET /api/users/:id
```

#### List Users (with pagination)
```
GET /api/users?page=1&page_size=10
```

### Health Check

```
GET /health
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `fyp_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | Server port | `8080` |
| `ENV` | Environment | `development` |

## Development

### Running Tests

```bash
go test ./...
```

### Code Formatting

```bash
go fmt ./...
```

### Linting

```bash
golangci-lint run
```

## Security Features

- **Password Hashing**: Uses bcrypt with cost factor 12
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: Basic rate limiting to prevent abuse
- **SQL Injection Protection**: Uses parameterized queries
- **XSS Protection**: Input sanitization

## Production Deployment

For production deployment:

1. Set `ENV=production` in your environment variables
2. Use a strong, unique `JWT_SECRET`
3. Configure proper CORS origins
4. Set up a production PostgreSQL database
5. Use a reverse proxy (nginx) for SSL termination
6. Consider using Redis for rate limiting
7. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 