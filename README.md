# Landing Page Generator with AI

An AI-powered landing page generator built with Next.js, NextAuth, Prisma, and OpenAI.

## Features

- 🤖 AI-powered landing page generation
- 🎨 Multiple landing page templates
- 🔒 Secure authentication with NextAuth
- 💾 Database storage with Prisma
- 🔄 Asynchronous code generation
- 📱 Responsive design
- ✨ Real-time status updates

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- NextAuth.js
- Prisma ORM
- OpenAI API
- Supabase (PostgreSQL)
- TailwindCSS

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase)
- OpenAI API key

## Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

## Database Schema

```prisma
model Asymmetri {
  id         Int      @id @default(autoincrement())
  email      String   @unique
  password   String
  code       String?
  status     String?  @default("idle")
  created_at DateTime @default(now())
}
```

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/chat` - AI code generation
- `/api/status` - Generation status check
- `/api/signup` - User registration

## Project Status Note

This project was developed as part of an assignment with the following completion status:

✅ Completed Features:
- User authentication with NextAuth
- AI integration with OpenAI
- Asynchronous code generation
- Database integration with Prisma
- Status tracking for generation
- Basic error handling
- Secure API routes

⏳ Pending/Future Improvements:
- Different landing page templates (currently using a single template system)
- More comprehensive testing

Note: Due to time constraints, some features might have minor issues that need to be addressed in future updates.

