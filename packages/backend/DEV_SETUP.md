# Development Setup Guide

This guide will help you set up the Community Trip Organizer backend for local development using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) package manager

## Quick Start

### 1. Start the Development Database

```bash
# From the backend directory
cd packages/backend

# Start PostgreSQL with Docker
docker-compose up -d

# Check if the database is running
docker-compose ps
```

This will start:
- **PostgreSQL** on `localhost:5432`
- Data persists in a Docker volume

### 2. Set Up Environment Variables

Copy the example environment file and update as needed:

```bash
cp .env.example .env
```

The default `.env` should work with the Docker setup:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### 3. Run Database Migrations

Apply all database migrations to set up your schema:

```bash
npx prisma migrate dev
```

### 4. Seed the Database

Populate your database with development data:

```bash
yarn db:seed
```

This creates:
- 1 Super Admin
- 3 Trip Admins
- 6 Families (various statuses)
- 3 Trips (2 active, 1 draft)
- Gear items and assignments

See [SEED_DATA.md](./prisma/SEED_DATA.md) for login credentials and complete data documentation.

### 5. Start the Development Server

```bash
yarn dev
```

The API will be available at `http://localhost:3001`

## Docker Commands

### Start the Database

```bash
docker-compose up -d
```

### Stop the Database

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

### View Database Logs

```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI

```bash
docker-compose exec postgres psql -U user -d mydb
```

## Optional: PgAdmin (Database GUI)

To start pgAdmin for database management:

```bash
docker-compose --profile tools up -d
```

Access pgAdmin at `http://localhost:5050`:
- Email: `admin@example.com`
- Password: `admin`

To connect to PostgreSQL from pgAdmin:
- Host: `postgres` (or `host.docker.internal` on Mac/Windows)
- Port: `5432`
- Database: `mydb`
- Username: `user`
- Password: `password`

## Prisma Commands

### Open Prisma Studio

Browse and edit your database with a GUI:

```bash
npx prisma studio
```

Access at `http://localhost:5555`

### Reset Database

Drop all data and re-run migrations:

```bash
npx prisma migrate reset
```

### Reset and Seed

```bash
yarn db:reset
```

### Create a New Migration

```bash
npx prisma migrate dev --name description_of_changes
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Development Workflow

1. **Start fresh:**
   ```bash
   docker-compose up -d
   npx prisma migrate dev
   yarn db:seed
   yarn dev
   ```

2. **Daily development:**
   ```bash
   # Database is already running
   yarn dev
   ```

3. **Reset when needed:**
   ```bash
   yarn db:reset
   yarn dev
   ```

4. **Stop everything:**
   ```bash
   docker-compose down
   # Stop backend with Ctrl+C
   ```

## Troubleshooting

### Database Connection Error

If you see `Can't reach database server`:

1. Check if Docker is running: `docker ps`
2. Check if PostgreSQL is running: `docker-compose ps`
3. Restart the database: `docker-compose restart postgres`

### PostgreSQL Version Mismatch

If you see an error about PostgreSQL version mismatch (e.g., "initialized by PostgreSQL version 13, not compatible with version 16"):

```bash
# This will delete all data and start fresh
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
yarn db:seed
```

### Port Already in Use

If port 5432 is already in use:

1. Stop other PostgreSQL instances
2. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - '5433:5432'
   ```
   And update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5433/mydb?schema=public"
   ```

### Clear All Data

To start completely fresh:

```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
yarn db:seed
```

**📖 For more troubleshooting help, see [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)**

## Environment Files

- `.env` - Your local development configuration (git-ignored)
- `.env.example` - Template with all required variables
- `.env.test` - Test environment configuration (for automated tests)

## Database Tools

You have several options to view/manage your database:

1. **Prisma Studio** (Recommended): `npx prisma studio`
2. **pgAdmin**: `docker-compose --profile tools up -d`
3. **TablePlus** / **DBeaver** / **DataGrip**: Use connection string from `.env`
4. **CLI**: `docker-compose exec postgres psql -U user -d mydb`

## Next Steps

- Review [README.md](./README.md) for API documentation
- Check [SEED_DATA.md](./prisma/SEED_DATA.md) for login credentials
- Explore the API at `http://localhost:3001/api/health`
- Test authentication with seeded users
