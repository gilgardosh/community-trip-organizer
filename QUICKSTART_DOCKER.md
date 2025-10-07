# 🚀 Quick Start: Docker Development Setup

## TL;DR - Get Started in 30 Seconds

```bash
cd packages/backend
./setup-dev.sh
yarn dev
```

That's it! Your development environment is ready. 🎉

---

## What You Get

📦 **PostgreSQL Database** running in Docker  
🌱 **Seeded Test Data** with users, trips, and families  
🔐 **Login Credentials** for testing (password: `password123`)  
🛠️ **Prisma Studio** for database management  
📝 **Hot Reload** development server

---

## Visual Workflow

```
┌─────────────────────────────────────────────┐
│  1. Start Database Container                │
│     cd packages/backend                     │
│     yarn db:dev:start                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. Run Migrations                          │
│     npx prisma migrate dev                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Seed Database                           │
│     yarn db:seed                            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. Start Development Server                │
│     yarn dev                                │
└─────────────────────────────────────────────┘
```

---

## Daily Commands

### Start Working

```bash
# Just run the dev server (DB already running)
yarn dev
```

### View/Edit Database

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database

```bash
yarn db:reset
# Wipes and reseeds everything
```

---

## Test Users (All use password: `password123`)

| Role           | Email                    | Use For        |
| -------------- | ------------------------ | -------------- |
| 🔑 Super Admin | admin@example.com        | Full access    |
| 👔 Trip Admin  | john.johnson@example.com | Managing trips |
| 👤 Family User | david.chen@example.com   | Regular user   |

---

## Connection Info

**API Server:** http://localhost:3001  
**Database:** postgresql://user:password@localhost:5432/mydb  
**Prisma Studio:** http://localhost:5555 (when running)

---

## Common Tasks

### Feature Development

```bash
# 1. Start coding
yarn dev

# 2. View data
npx prisma studio

# 3. Make schema changes
# Edit prisma/schema.prisma
npx prisma migrate dev --name my_change

# 4. Reseed if needed
yarn db:seed
```

### Database Schema Change

```bash
# 1. Edit schema
vim prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Seed updated (if needed)
yarn db:seed
```

### Troubleshooting

```bash
# Database not connecting?
yarn db:dev:restart

# Check logs
yarn db:dev:logs

# Nuclear option (start fresh)
yarn db:dev:clean
yarn db:dev:start
npx prisma migrate dev
yarn db:seed
```

---

## File Structure

```
packages/backend/
├── docker-compose.yml       ← Docker configuration
├── setup-dev.sh            ← Automated setup script
├── .env                    ← Your local config (git-ignored)
├── .env.example            ← Template
└── prisma/
    ├── schema.prisma       ← Database schema
    ├── seed.ts             ← Seed script
    └── migrations/         ← Migration history
```

---

## 📚 More Documentation

- [DOCKER_DEV_GUIDE.md](./DOCKER_DEV_GUIDE.md) - Quick reference
- [DEV_SETUP.md](./packages/backend/DEV_SETUP.md) - Detailed guide
- [SEED_DATA.md](./packages/backend/prisma/SEED_DATA.md) - All test data

---

## 🆘 Help

### Port 5432 already in use?

```bash
# Check what's using it
lsof -i :5432

# Stop it, or use different port in docker-compose.yml
```

### Docker not running?

```bash
# Start Docker Desktop
open -a Docker

# Wait for it to start, then:
yarn db:dev:start
```

### Want to use pgAdmin GUI?

```bash
docker-compose --profile tools up -d
# Visit http://localhost:5050
# Login: admin@example.com / admin
```

---

**Happy Coding! 🎉**
