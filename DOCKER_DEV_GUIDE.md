# Docker Development Setup - Quick Reference

## 🚀 Getting Started

### First Time Setup

```bash
cd packages/backend
./setup-dev.sh
```

**OR manually:**

```bash
cd packages/backend
yarn db:dev:start
npx prisma migrate dev
yarn db:seed
yarn dev
```

### Daily Development

```bash
# Already set up? Just start the server:
cd packages/backend
yarn dev
```

## 📦 Docker Commands

| Command               | Description              |
| --------------------- | ------------------------ |
| `yarn db:dev:start`   | Start PostgreSQL         |
| `yarn db:dev:stop`    | Stop PostgreSQL          |
| `yarn db:dev:restart` | Restart PostgreSQL       |
| `yarn db:dev:logs`    | View database logs       |
| `yarn db:dev:clean`   | Stop and delete all data |

## 🗄️ Database Commands

| Command                  | Description              |
| ------------------------ | ------------------------ |
| `npx prisma studio`      | Open database GUI        |
| `npx prisma migrate dev` | Create/apply migrations  |
| `yarn db:seed`           | Seed with test data      |
| `yarn db:reset`          | Reset & reseed database  |
| `npx prisma generate`    | Regenerate Prisma Client |

## 🔗 Connection Info

**Database URL:**

```
postgresql://user:password@localhost:5432/mydb
```

**Access Points:**

- API: `http://localhost:3001`
- Prisma Studio: `http://localhost:5555` (after running `npx prisma studio`)
- pgAdmin: `http://localhost:5050` (if started with `docker-compose --profile tools up -d`)

## 👥 Seed Data Login Credentials

All users have password: `password123`

| Role                        | Email                     |
| --------------------------- | ------------------------- |
| Super Admin                 | admin@example.com         |
| Trip Admin (Summer Camp)    | john.johnson@example.com  |
| Trip Admin (Winter Retreat) | michael.smith@example.com |
| Regular Family User         | david.chen@example.com    |

See [SEED_DATA.md](./packages/backend/prisma/SEED_DATA.md) for complete list.

## 🛠️ Troubleshooting

### Database won't connect?

```bash
# Check if Docker is running
docker ps

# Restart the database
yarn db:dev:restart

# Check logs
yarn db:dev:logs
```

### PostgreSQL version mismatch?

```bash
# This happens when upgrading PostgreSQL versions
# Delete old data and start fresh:
yarn db:dev:clean
yarn db:dev:start
npx prisma migrate dev
yarn db:seed
```

### Port 5432 already in use?

Edit `packages/backend/docker-compose.yml`:

```yaml
ports:
  - '5433:5432' # Change to 5433
```

Then update `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5433/mydb?schema=public"
```

### Start completely fresh?

```bash
yarn db:dev:clean    # Delete all data
yarn db:dev:start    # Start fresh
npx prisma migrate dev
yarn db:seed
```

**📖 For detailed troubleshooting, see [DOCKER_TROUBLESHOOTING.md](./packages/backend/DOCKER_TROUBLESHOOTING.md)**

## 📚 Documentation

- [DEV_SETUP.md](./packages/backend/DEV_SETUP.md) - Detailed setup guide
- [README.md](./packages/backend/README.md) - Backend documentation
- [SEED_DATA.md](./packages/backend/prisma/SEED_DATA.md) - Seed data reference

## 🎯 Workflow Examples

### Start new feature

```bash
yarn db:dev:start
yarn dev
# Code your feature
npx prisma studio  # View/edit data
```

### Database schema change

```bash
# Edit packages/backend/prisma/schema.prisma
npx prisma migrate dev --name add_new_field
yarn db:seed  # Optional: reseed
```

### Reset everything

```bash
yarn db:dev:clean
yarn db:dev:start
npx prisma migrate dev
yarn db:seed
```
