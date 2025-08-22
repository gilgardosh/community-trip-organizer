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

## Development

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

- `yarn build`: Compiles the TypeScript code.
- `yarn start`: Runs the compiled code from the `dist` directory.
- `yarn dev`: Starts the development server with `nodemon`.
- `yarn lint`: Lints the code using ESLint.
- `yarn format`: Formats the code with Prettier.

### Frontend (`packages/frontend`)

- `yarn dev`: Starts the Vite development server.
- `yarn build`: Builds the frontend application for production.
- `yarn lint`: Lints the code using ESLint.
- `yarn format`: Formats the code with Prettier.
- `yarn preview`: Previews the production build locally.
