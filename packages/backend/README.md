# Backend API

This is the backend API for the Community Trip Organizer application.

## Development

### Setup

1. Install dependencies:

```bash
yarn install
```

2. Set up your environment variables (create `.env` file based on `.env.example`)

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Seed the database with development data:

```bash
yarn db:seed
```

### Running the Server

```bash
yarn dev
```

The server will start on `http://localhost:3001` (or your configured port).

## Development Seed Data

The project includes a comprehensive seed script that creates:

- **1 Super Admin** - Full system access
- **3 Trips** - 2 active trips and 1 draft trip
- **6 Families** - Various statuses (approved, pending, inactive)
- **3 Trip Admins** - One for each trip
- **Gear Items & Assignments** - Sample gear for trips

### Quick Login Credentials

All users have the password: **`password123`**

- **Super Admin:** `admin@example.com`
- **Trip Admin (Summer Camp):** `john.johnson@example.com`
- **Trip Admin (Winter Retreat):** `michael.smith@example.com`
- **Trip Admin (Beach - Draft):** `carlos.garcia@example.com`
- **Regular Family User:** `david.chen@example.com`
- **Pending Approval:** `robert.wilson@example.com`

For complete seed data documentation, see [SEED_DATA.md](./prisma/SEED_DATA.md)

## Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn db:seed` - Seed database with development data
- `yarn lint` - Lint code
- `yarn format` - Format code with Prettier

## Testing

Run tests with:

```bash
yarn test
```

Or in watch mode:

```bash
yarn test:watch
```

## Database

The project uses Prisma with PostgreSQL.

### Migrations

Create a new migration:

```bash
npx prisma migrate dev --name description_of_changes
```

Apply migrations:

```bash
npx prisma migrate deploy
```

View database in Prisma Studio:

```bash
npx prisma studio
```

### Resetting Database

To reset and reseed the database:

```bash
npx prisma migrate reset
yarn db:seed
```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Utility functions

prisma/
├── schema.prisma    # Database schema
├── seed.ts          # Seed script
├── SEED_DATA.md     # Seed data documentation
└── migrations/      # Database migrations

tests/
└── ...              # Test files
```
