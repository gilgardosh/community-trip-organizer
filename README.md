# Neighborhood Trip Planning App

## Overview

This is a responsive web app to manage neighborhood family trips. It supports planning, attendance tracking, dietary requirements, shared gear, and trip schedules. The app integrates with WhatsApp for notifications by generating copy-paste-ready messages. It is designed to be fully in Hebrew with RTL support.

The application has three user roles:

- **Family:** Can view trips, mark attendance, update their family profile, and volunteer for gear.
- **Trip Admin:** Manages assigned trips, including participants, gear, dietary info, and schedules.
- **Super-admin:** Approves new families and trips, manages trip admins, and has oversight of all data.

## Tech Stack

- **Frontend:** React + TypeScript (with Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Deployment:** Vercel

## Project Structure

This project is a monorepo with two main packages:

- `packages/frontend`: The React frontend application.
- `packages/backend`: The Node.js Express backend API.

## Setup and Installation

### Quick Start with Docker (Recommended)

The easiest way to get started is using our Docker development setup:

```bash
# 1. Clone the repository
git clone <repository-url>
cd community-trip-organizer

# 2. Install dependencies
yarn install

# 3. Set up the backend with Docker
cd packages/backend
./setup-dev.sh

# 4. Start the backend
yarn dev

# 5. In a new terminal, start the frontend
cd packages/frontend
yarn dev
```

**📚 See [QUICKSTART_DOCKER.md](./QUICKSTART_DOCKER.md) for detailed Docker setup guide.**

### Manual Setup (Without Docker)

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd community-trip-organizer
   ```

2. **Install dependencies:**
   This project uses Yarn workspaces. Install all dependencies from the root directory.
   ```bash
   yarn install
   ```

3. **Set up the database:**
   - Install PostgreSQL locally
   - Create a database
   - Copy `packages/backend/.env.example` to `packages/backend/.env`
   - Update `DATABASE_URL` in `.env` with your database credentials
   
4. **Run migrations and seed:**
   ```bash
   cd packages/backend
   npx prisma migrate dev
   yarn db:seed
   ```

## Development

### With Docker (Recommended)

```bash
# Start the database (first time only)
cd packages/backend
yarn db:dev:start

# Start the backend
yarn dev
```

In a new terminal:
```bash
# Start the frontend
cd packages/frontend
yarn dev
```

**Access Points:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Prisma Studio: `npx prisma studio` (http://localhost:5555)

### Without Docker

To run both the frontend and backend concurrently, you can open two terminal tabs.

### Running the Backend

```bash
cd packages/backend
yarn dev
```

The backend server will start on `http://localhost:3001`.

### Running the Frontend

```bash
cd packages/frontend
yarn dev
```

The frontend development server will start on `http://localhost:5173`.

## Available Scripts

### Root

- `yarn install`: Installs dependencies for all packages.

### Backend (`packages/backend`)

#### Development
- `yarn dev`: Starts the development server with `nodemon`.
- `yarn db:dev:start`: Start PostgreSQL with Docker
- `yarn db:dev:stop`: Stop PostgreSQL
- `yarn db:seed`: Seed database with development data
- `yarn db:reset`: Reset and reseed database

#### Build & Deploy
- `yarn build`: Compiles the TypeScript code.
- `yarn start`: Runs the compiled code from the `dist` directory.

#### Testing
- `yarn test`: Runs API tests using Vitest.

#### Code Quality
- `yarn lint`: Lints the code using ESLint.
- `yarn format`: Formats the code with Prettier.

**See [packages/backend/README.md](./packages/backend/README.md) for complete backend documentation.**

### Frontend (`packages/frontend`)

#### Development
- `yarn dev`: Starts the Vite development server.
- `yarn preview`: Previews the production build locally.

#### Build & Deploy
- `yarn build`: Builds the frontend application for production.

#### Code Quality
- `yarn lint`: Lints the code using ESLint.
- `yarn format`: Formats the code with Prettier.

**See [packages/frontend/README.md](./packages/frontend/README.md) for frontend documentation.**

## Documentation

- 🚀 [QUICKSTART_DOCKER.md](./QUICKSTART_DOCKER.md) - Get started with Docker in 30 seconds
- 📖 [DOCKER_DEV_GUIDE.md](./DOCKER_DEV_GUIDE.md) - Docker development quick reference
- 🔧 [packages/backend/DEV_SETUP.md](./packages/backend/DEV_SETUP.md) - Detailed backend setup guide
- 🌱 [packages/backend/prisma/SEED_DATA.md](./packages/backend/prisma/SEED_DATA.md) - Test user credentials
- 📋 [SPEC.md](./SPEC.md) - Application specifications
