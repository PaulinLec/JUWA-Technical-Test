    

# LinkedIn Intelligence API

This project scrapes LinkedIn profile data, summarizes it using GPT, and exposes it via a secured REST API built with NestJS. The data is stored in a PostgreSQL database managed by Supabase, and the scraping is done using Selenium.

## Project Structure

juwa-technical-test/
├── prisma/    # Prisma schema & migrations
│   └── schema.prisma
├── src/
│   ├── main.ts  # Entry point
│   ├── app.module.ts
│   ├── auth/    # JWT guard (hardcoded)
│   ├── gpt    # GPT integration
│   ├── prisma/    # Prisma client service
│   └── profiles/    # Core business logic
│       ├── dto/    # DTOs for request/response
│       ├── profiles.controller.ts
│       ├── profiles.service.ts
│       └── profiles.module.ts
├── scrape_profile.py    # Python script for scraping LinkedIn
├── .env    # Environment variables (DB, API keys)
├── requirements.txt    # Python dependencies for scraping
└── README.md

## Getting Started (Local)

### 1. Clone the repo

```bash
git clone https://github.com/PaulinLec/JUWA-Technical-Test.git
cd juwa-technical-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your `.env`

Create a `.env` file at the root:

```bash
DATABASE_URL="postgresql://user:pass@host:port/db"
DIRECT_URL="postgresql://user:pass@host:port/db"

LINKEDIN_EMAIL="john.doe@email.com"
LINKEDIN_PASSWORD="password"

OPENAI_API_KEY="sk-..."
```

If using Supabase, use the connection string from the Supabase dashboard.

### 4. Set up Prisma + DB

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the project

```bash
npm run start:dev
```

## How it Works

1. **POST** `/profiles` with a LinkedIn profile URL
   → Triggers a Python scraping script
   → Extracted data is sent to OpenAI GPT
   → GPT generates a HTML summary
   → Both raw data and summary are stored in Supabase (via Prisma)
   → Returns the raw data and generated summary
2. **GET** `/profiles`
   → Returns all processed profiles

## Auth

The API is secured with a hardcoded JWT token. You can find the token in `src/auth/jwt-auth.guard.ts`. This is a placeholder and should be replaced with a proper authentication mechanism for production.

## Swagger

You can access the Swagger UI at `http://localhost:3000/api` to explore the API endpoints and their documentation.

## Python Script

The Python script `scrape_profile.py` is responsible for scraping LinkedIn profiles. It uses Selenium to navigate the LinkedIn page and extract relevant data. The script is called from the NestJS service when a new profile is requested.

## Dependencies

- **NestJS** (Backend framework)
- **Prisma** (ORM)
- **Supabase** (PostgreSQL DB)
- **OpenAI GPT-4**
- **Selenium** (for scraping)

Make sure to have the necessary Python packages installed for the scraping script. You can do this by running:

```bash
pip install -r requirements.txt
```

## Notes

- The scraping script requires a LinkedIn account to log in. Make sure to use a valid account.
- If LinkedIn triggers a CAPTCHA, you may have to solve it manually during scraping.
- For production, implement real JWT auth instead of hardcoded token.
