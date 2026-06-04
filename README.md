# express-starter

To install dependencies:

```bash
bun install
```

## Running the Application

1. **Start PostgreSQL** (if running locally), then create a database for the app.

2. **Copy environment variables**:

```bash
cp .env.example .env
# Edit .env with your actual values (especially DATABASE_URL and JWT_SECRET)
```

3. **Run in development**:

```bash
bun run dev
```

The app creates the `users` table automatically on first connect.

4. **Build for production**:

```bash
bun run build
bun run start:prod
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
