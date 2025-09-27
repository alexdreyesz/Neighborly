# ShellHacks Backend

A comprehensive Express.js backend API for the ShellHacks project, featuring secure shell command execution, user management, and robust middleware architecture.

## 🚀 Features

- **Express.js Framework**: Modern, fast, and unopinionated web framework
- **Security First**: Helmet, CORS, rate limiting, and input validation
- **Shell Command Execution**: Secure command execution with whitelisting
- **User Management**: Complete CRUD operations for users
- **Health Monitoring**: Comprehensive health check endpoints
- **Error Handling**: Centralized error handling with custom error classes
- **Request Logging**: Detailed request/response logging
- **Environment Configuration**: Flexible configuration management
- **API Documentation**: Built-in API documentation endpoint

## 📁 Project Structure

```
backend/
├── config/
│   └── config.js              # Configuration management
├── controllers/
│   ├── userController.js      # User-related business logic
│   └── shellController.js     # Shell command execution logic
├── middleware/
│   ├── errorHandler.js        # Error handling middleware
│   └── requestLogger.js       # Request logging middleware
├── routes/
│   ├── api.js                 # Main API router
│   ├── health.js              # Health check routes
│   ├── users.js               # User management routes
│   └── shell.js               # Shell command routes
├── utils/
│   └── helpers.js             # Utility helper functions
├── tests/                     # Test files (to be added)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
├── server.js                 # Main application entry point
└── README.md                 # This file
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shellhacks/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🚀 Usage

### Starting the Server

```bash
# Development with nodemon (auto-restart on changes)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### API Endpoints

#### Health Check
- `GET /health` - Basic health check
- `GET /api/health` - API health check
- `GET /api/health/detailed` - Detailed system information
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check

#### User Management
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/profile/me` - Update current user profile

#### Shell Commands
- `GET /api/shell/commands` - Get available commands
- `POST /api/shell/execute` - Execute shell command
- `GET /api/shell/history` - Get command history
- `GET /api/shell/history/:id` - Get command details
- `DELETE /api/shell/history/:id` - Delete command from history
- `GET /api/shell/system-info` - Get system information
- `POST /api/shell/validate-command` - Validate command safety

#### API Documentation
- `GET /api/docs` - API documentation

### Example API Calls

#### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

#### Execute a Shell Command
```bash
curl -X POST http://localhost:3000/api/shell/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command": "ls -la",
    "timeout": 5000
  }'
```

#### Health Check
```bash
curl http://localhost:3000/api/health/detailed
```

## 🔒 Security Features

### Command Execution Security
- **Command Whitelisting**: Only pre-approved commands can be executed
- **Flag Validation**: Only specific flags are allowed for each command
- **Blacklist Protection**: Dangerous commands are explicitly blocked
- **Timeout Protection**: Commands have execution time limits
- **Working Directory Control**: Commands are restricted to safe directories

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security Headers**: Security headers for protection
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Secure error responses without information leakage

### Allowed Commands
The following commands are whitelisted for safe execution:

**File System**: `ls`, `pwd`, `whoami`, `date`, `uptime`, `df`, `free`, `ps`, `top`, `cat`, `head`, `tail`, `wc`, `grep`, `find`, `du`

**Network**: `ping`, `curl`, `wget`

**Development**: `git`, `node`, `npm`

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
Tests should be organized in the `tests/` directory:
- `tests/unit/` - Unit tests for individual functions
- `tests/integration/` - Integration tests for API endpoints
- `tests/controllers/` - Controller-specific tests

## 📊 Monitoring & Logging

### Health Monitoring
The application provides multiple health check endpoints:

- **Liveness**: `/api/health/live` - Basic process health
- **Readiness**: `/api/health/ready` - Dependencies health
- **Detailed**: `/api/health/detailed` - Comprehensive system info

### Request Logging
All requests are logged with:
- Request method and path
- Response status and duration
- IP address and user agent
- Request/response bodies (in development)

### Error Logging
Errors are logged with:
- Error stack traces
- Request context
- User information (when available)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:3001` |
| `JWT_SECRET` | JWT signing secret | `your-fallback-secret-key` |
| `DATABASE_URL` | Database connection string | - |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Configuration Files
- `config/config.js` - Centralized configuration management
- `.env.example` - Environment variables template

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET`
- [ ] Set up proper `CORS_ORIGINS`
- [ ] Configure database connection
- [ ] Set up process manager (PM2, Docker, etc.)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring and logging
- [ ] Set up backup strategies

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configurations

#### Development
- Detailed error messages
- Request/response body logging
- Hot reload with nodemon

#### Production
- Minimal error information
- Performance optimizations
- Process management
- Security hardening

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Style
- Use ESLint for code linting
- Follow JavaScript best practices
- Add JSDoc comments for functions
- Write meaningful commit messages

### Testing Guidelines
- Write unit tests for all new functions
- Add integration tests for new endpoints
- Maintain test coverage above 80%
- Test error conditions and edge cases

## 📝 API Documentation

### Response Format
All API responses follow a consistent format:

```json
{
  "status": "success|error",
  "data": { ... },
  "message": "Human readable message",
  "pagination": { ... } // For paginated responses
}
```

### Error Format
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Authentication
Currently using mock authentication. In production, implement:
- JWT token-based authentication
- Refresh token mechanism
- Role-based access control
- Session management

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### Permission Denied for Commands
- Ensure commands are in the whitelist
- Check command flags are allowed
- Verify working directory permissions

#### CORS Errors
- Check `CORS_ORIGINS` configuration
- Ensure frontend URL is included
- Verify request headers

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug namespace
DEBUG=shellhacks:* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation at `/api/docs`

---

**⚠️ Security Notice**: This application executes shell commands and should be properly secured in production environments. Ensure proper authentication, authorization, and network security measures are in place.
