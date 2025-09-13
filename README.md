# 🚀 Greedy Todo Backend - Real-Time API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-green" alt="Node.js Express"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MongoDB-8.18-green" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Socket.io-4.8-black" alt="Socket.io"/>
  <img src="https://img.shields.io/badge/Passport.js-Auth-red" alt="Passport.js"/>
</div>

<div align="center">
  <p><em>A full-stack backend with real-time features and smart authentication</em></p>
</div>

Built this to learn **real-time systems** and **modern auth patterns**. Every feature was designed to solve real problems, not just follow tutorials.

## 🏗️ **Key Features**

### **1. Triple Authentication System**
```typescript
// Smart auth handling
authProvider: "local" | "google" | "guest"
```

**What I Built:**
- **JWT tokens** with different expiry times
- **Google OAuth** integration with user merging
- **Guest users** with 24-hour sessions
- **Role switching** (normaluser ↔ superuser)

### **2. Real-Time Notifications**
```typescript
// Smart deadline detection
export const startNotificationJob = (io: Server) => {
  setInterval(async () => {
    for (const [socketId, socket] of io.sockets.sockets) {
      const userId = socket.data.userId;
      const userTasks = await getUserTasksStatus(userId);
      socket.emit("getNotification", userTasks);
    }
  }, 10000);
};
```

**Real-Time Features:**
- **4-hour deadline warnings** sent automatically
- **Live role updates** across all devices
- **User-specific notifications** via WebSocket
- **Connection tracking** with user IDs

### **3. Smart Data Models**
```typescript
// Conditional validation
password: {
  type: String,
  required: function (this: IUser) {
    return !this.googleId && !this.isGuest;
  },
  minlength: 8,
}
```

**Database Design:**
- **Flexible user types** (local, Google, guest)
- **Automatic timestamps** and updates
- **User-scoped data** (users only see their tasks)
- **Efficient queries** with lean operations

## 🚀 **API Endpoints**

### **Authentication**
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # Local login
POST /api/auth/guest-login       # Guest session
GET  /api/auth/google            # Google OAuth
```

### **Tasks**
```http
GET    /api/task                 # Get user's tasks
POST   /api/task                 # Create task
PUT    /api/task/:id             # Update task
DELETE /api/task/:id             # Delete task
```

### **Users**
```http
GET  /api/user                   # Get all users
PUT  /api/user/profile           # Update profile
PUT  /api/user/role/:id          # Change role
```

## 🎓 **What I Learned**

### **Real-Time Systems**
- **WebSocket connections** and user tracking
- **Event-driven notifications** for deadlines
- **Connection management** and reconnection logic
- **Smart polling** instead of constant checking

### **Authentication**
- **Multi-provider auth** (Local, Google, Guest)
- **JWT token management** with different expiry times
- **Role-based access** and permission handling
- **Guest user lifecycle** with automatic cleanup

### **Database Design**
- **MongoDB schemas** with TypeScript
- **Conditional validation** based on user types
- **User-scoped data** for security
- **Efficient queries** with lean operations

### **API Architecture**
- **RESTful design** with proper status codes
- **Error handling** and validation
- **Middleware patterns** for auth
- **Modular structure** for maintainability

## 🚀 **Quick Start**

```bash
# Clone and install
git clone https://github.com/yourusername/greedy-todo-backend.git
cd greedy-todo-backend
npm install

# Set up environment
cp .env.example .env
# Add your MongoDB URI, JWT secret, and Google OAuth credentials

# Start development
npm run dev
```

### **Environment Variables**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
PORT=8000
```

## 🏗️ **Project Structure**
```
src/
├── config/          # Passport.js setup
├── controllers/     # Business logic
├── middleware/      # Auth & validation
├── models/          # MongoDB schemas
├── routes/          # API endpoints
└── utils/           # Notification system
```

---

<div align="center">
  <p>Built by <strong>Vaishnavi Rastogi</strong> as a learning project</p>
  <p>
    <a href="https://github.com/iScreenager">GitHub</a> •
    <a href="https://linkedin.com/in/vaishnavi-rastogi-104501194">LinkedIn</a>
  </p>
</div>
