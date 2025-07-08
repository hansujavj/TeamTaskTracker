# TaskFlow - Team Task Manager

## Overview

TaskFlow is a React-based team task management application that enables efficient task distribution and tracking within teams. The application features role-based access control with Team Leads who can create domains and tasks, and Team Members who can select preferred domains and complete assigned tasks. The system includes automated task distribution, deadline tracking, and auto-reassignment capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Task Scheduling**: Node-cron for automated deadline checking and task reassignment
- **API**: RESTful API design with middleware for authentication and role-based access

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Provider**: Neon Database for serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Authentication System
- JWT token-based authentication with localStorage persistence
- Role-based access control (Team Lead vs Team Member)
- Protected routes with automatic token validation
- Password hashing using bcrypt

### Domain Management
- Custom domain creation by Team Leads
- Team member domain preference selection
- Domain-based task assignment logic

### Task Management
- Task creation with title, description, domain, deadline, and priority
- Automated task assignment using round-robin distribution
- Task status tracking (pending, completed)
- Priority levels (low, medium, high, urgent)

### Automated Systems
- Cron job running every minute to check for overdue tasks
- Automatic task reassignment when deadlines are missed
- Notification system for deadline reminders

## Data Flow

1. **User Authentication**: Users log in with email/password, receive JWT token
2. **Domain Selection**: Team members select preferred domains after authentication
3. **Task Creation**: Team leads create tasks specifying domain, deadline, and details
4. **Task Assignment**: System automatically assigns tasks to available team members in specified domain using round-robin logic
5. **Task Completion**: Team members mark tasks as completed
6. **Deadline Monitoring**: Cron job continuously monitors for overdue tasks and triggers reassignment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitive components
- **bcrypt**: Password hashing for security
- **jsonwebtoken**: JWT token generation and validation
- **node-cron**: Task scheduling for automated processes
- **drizzle-orm**: Type-safe database operations

### Development Dependencies
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- In-memory storage for rapid prototyping
- Environment variable configuration for database connection

### Production Build
- Vite builds the client-side React application
- ESBuild bundles the server-side Express application
- Static file serving for the built React app
- PostgreSQL database with connection pooling

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment mode (development/production)

## Recent Changes

### July 08, 2025 - Major Feature Updates
- ✓ Moved logout button to compact bottom corner layout for better UX
- ✓ Added functional navbar with working routing to Dashboard, Domains, and Reports
- ✓ Created comprehensive UserProfile component showing user identity, domain, and assigned tasks
- ✓ Implemented dynamic notification system based on actual overdue and urgent tasks
- ✓ Made Quick Actions on dashboard functional - linked to actual Domains and Reports pages
- ✓ Added full responsive design support for mobile, tablet, and desktop
- ✓ Fixed team member auto-refresh functionality every 30 seconds
- ✓ Domain creation now fully functional for team leads
- ✓ Reports page shows real team performance analytics

### July 07, 2025
- Initial setup with authentication, task management, and database integration

## User Preferences

Preferred communication style: Simple, everyday language.