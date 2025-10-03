# Taskly - Task Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/x0lg0n/task-management-system" />
  <img src="https://img.shields.io/github/last-commit/x0lg0n/task-management-system" />
  <img src="https://img.shields.io/github/issues/x0lg0n/task-management-system" />
</p>

A clean, minimal task management system where users can create, prioritize, and manage tasks with drag-and-drop boards.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Design System](#design-system)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Security](#security)
- [Support](#support)

## Features

- ✅ **User Authentication** - Secure signup/login/logout with JWT tokens
- ✅ **Task Management** - Create, read, update, and delete tasks
- ✅ **Priority Organization** - Organize tasks by priority (High, Medium, Low, Backlog)
- ✅ **Drag-and-Drop** - Intuitive drag-and-drop interface for moving tasks between priority lists
- ✅ **Task Status** - Track task progress (pending, in-progress, completed)
- ✅ **Task Assignment** - Assign tasks to team members
- ✅ **Pagination** - Efficiently manage large numbers of tasks
- ✅ **Responsive Design** - Works on all device sizes
- ✅ **Dark Mode** - Eye-friendly dark theme support
- ✅ **Accessibility** - WCAG compliant UI components

## Tech Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Forms**: react-hook-form + Zod validation
- **Drag & Drop**: @dnd-kit/core
- **Animations**: Framer Motion

### Backend
- **Stack**: MERN (MongoDB, Express, Node.js, React)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **Language**: JavaScript
- **Validation**: Joi for request validation

## Project Structure

```
.
├── frontend/                 # React TypeScript frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and API client
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript types and interfaces
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── package.json          # Frontend dependencies
├── backend/                  # Express JavaScript backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Server entry point
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
├── README.md                 # Project documentation
├── CONTRIBUTING.md           # Contribution guidelines
├── CODE_OF_CONDUCT.md        # Community code of conduct
└── SECURITY.md               # Security policy
```

## Screenshots

> _Screenshots will be added here_

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Git
- npm or yarn package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/x0lg0n/task-management-system.git
cd task-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start development servers (in separate terminals)
# Terminal 1: Start backend
cd ../backend
npm run dev

# Terminal 2: Start frontend
cd ../frontend
npm run dev
```

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
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/taskly

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| POST   | `/api/auth/signup`   | User registration     |
| POST   | `/api/auth/login`    | User login            |
| POST   | `/api/auth/refresh`  | Refresh access token  |
| POST   | `/api/auth/logout`   | User logout           |

### Tasks

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | `/api/tasks`         | Get paginated tasks          |
| POST   | `/api/tasks`         | Create new task              |
| GET    | `/api/tasks/:id`     | Get task details             |
| PUT    | `/api/tasks/:id`     | Update task                  |
| DELETE | `/api/tasks/:id`     | Delete task                  |

### Users

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | `/api/users`         | Get users list               |
| GET    | `/api/users/:id`     | Get user profile             |

## Design System

### Colors

| Priority | Color       | Hex Code | Usage                  |
|----------|-------------|----------|------------------------|
| High     | Red         | #EF4444  | Urgent tasks           |
| Medium   | Amber       | #F59E0B  | Important tasks        |
| Low      | Green       | #10B981  | Routine tasks          |
| Backlog  | Indigo      | #6366F1  | Future tasks           |

### Typography

- **Headlines**: Inter font family, `text-xl` and above
- **Body Text**: Inter font family, `text-base`
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components

- **Cards**: `rounded-2xl` with subtle shadows and glass morphism effect
- **Buttons**: Large, rounded with proper focus states and hover effects
- **Inputs**: Consistent styling with proper validation states
- **Spacing**: Consistent `p-4`, `gap-4` patterns using Tailwind spacing scale

## Development

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Linting

```bash
# Frontend linting
cd frontend && npm run lint

# Backend linting
cd backend && npm run lint
```

### Building for Production

```bash
# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build
```

### Code Quality

- Follow the established coding standards
- Write unit tests for new features
- Ensure all tests pass before submitting a pull request
- Use meaningful commit messages
- Keep pull requests focused on a single feature or bug fix

## Deployment

### Frontend

- **Platform**: Vercel/Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Set in deployment platform dashboard

### Backend

- **Platform**: Render/Railway/Heroku
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Database**: Use MongoDB Atlas for production database
- **Environment Variables**: Set in deployment platform dashboard

### CI/CD

This project uses GitHub Actions for continuous integration and deployment. Workflows are defined in `.github/workflows/`.

## Contributing

We love contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### Good First Issues

Looking for a good way to contribute? Check out issues labeled with [good first issue](https://github.com/x0lg0n/task-management-system/labels/good%20first%20issue).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

For security related issues, please refer to our [Security Policy](SECURITY.md).

## Support

If you have any questions or need help, please [open an issue](https://github.com/x0lg0n/task-management-system/issues/new) or contact the maintainers.

---

<p align="center">Made with ❤️ by the Taskly Team</p>