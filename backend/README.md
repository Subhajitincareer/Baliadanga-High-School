# MERN Backend Server

A complete MERN stack backend with JWT authentication and CRUD operations.

## Features

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **User Management** - User registration, login, and profile
- ✅ **Protected Routes** - Middleware-based authentication
- ✅ **CRUD Operations** - Complete item management system
- ✅ **Error Handling** - Comprehensive error middleware
- ✅ **MongoDB Integration** - Mongoose ODM with validation
- ✅ **ESM Modules** - Modern JavaScript module system
- ✅ **Password Hashing** - bcryptjs for secure passwords
- ✅ **Request Logging** - Morgan middleware for development
- ✅ **CORS Support** - Cross-origin resource sharing

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables in `.env`:**
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mern_app
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

## API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Item Management Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/items` | Get all user items | Private |
| POST | `/api/items` | Create new item | Private |
| GET | `/api/items/:id` | Get single item | Private |
| PUT | `/api/items/:id` | Update item | Private |
| DELETE | `/api/items/:id` | Delete item | Private |

### Health Check
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Server health check | Public |
| GET | `/` | API information | Public |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Item (Protected)
```bash
POST /api/items
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "Gaming laptop",
  "quantity": 1,
  "price": 1299.99,
  "category": "electronics"
}
```

## Project Structure

```
backend/
├── config/
│   └── db.js                # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── itemController.js    # Item CRUD operations
├── middlewares/
│   ├── authMiddleware.js    # JWT authentication
│   ├── asyncHandler.js      # Async error handler
│   └── errorHandler.js      # Global error handler
├── models/
│   ├── User.js              # User schema
│   └── Item.js              # Item schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── items.js             # Item routes
├── utils/
│   └── generateToken.js     # JWT token generation
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── README.md                # Documentation
└── server.js                # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_app
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## MongoDB Setup

Make sure MongoDB is running on your system:

### Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

### MongoDB Atlas (Cloud)
Replace `MONGO_URI` in `.env` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern_app
```

## Testing the API

Use tools like Postman, Insomnia, or curl to test the API:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Support

If you encounter any issues, please check:
1. MongoDB is running
2. Environment variables are set correctly
3. All dependencies are installed
4. Port 5000 is not in use by another application

Happy coding! 🚀
