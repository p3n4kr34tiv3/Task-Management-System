# Cleaner - Task Management System

A clean, minimal task management system where users can create, prioritize, and manage tasks with drag-and-drop boards.

## Tech Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Forms**: react-hook-form + zod validation
- **Drag & Drop**: @dnd-kit/core

### Backend
- **Stack**: MERN (MongoDB, Express, Node.js, React)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **Language**: TypeScript

## Features

✅ User authentication (signup/login/logout with JWT)
✅ Task CRUD operations
✅ Priority-based task organization (High, Medium, Low, Backlog)
✅ Drag-and-drop between priority lists
✅ Task status management (pending, in-progress, completed)
✅ Task assignment to users
✅ Paginated task lists
✅ Responsive, accessible UI with color-coded priorities

## Project Structure

```
.
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── package.json
├── backend/           # Express TypeScript backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cleaner-tasks
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks` - Get paginated tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get users list (for assignment)
- `GET /api/users/:id` - Get user profile

## Design System

### Colors
- **High Priority**: #EF4444 (Red)
- **Medium Priority**: #F59E0B (Amber)
- **Low Priority**: #10B981 (Green)
- **Backlog**: #6366F1 (Indigo)

### Typography
- Headlines: `text-xl` and above
- Body text: `text-base`

### Components
- Cards: `rounded-2xl` with subtle shadows
- Buttons: Large, rounded with proper focus states
- Spacing: Consistent `p-4`, `gap-4` patterns

## Development

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building for Production
```bash
# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build
```

## Deployment

### Frontend
- Deploy to Vercel/Netlify
- Build command: `npm run build`
- Output directory: `dist`

### Backend
- Deploy to Render/Railway/Heroku
- Use MongoDB Atlas for database
- Set environment variables in deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details