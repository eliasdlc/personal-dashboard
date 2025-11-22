# Personal Dashboard

> **Note:** This project is created for **learning purposes**. It serves as a practical exercise to understand Next.js full-stack development, API routes, and database integration.

## Overview

A personal dashboard application built to manage daily tasks and notes. This project demonstrates a full-stack implementation using the Next.js App Router.

## Features

### ✅ Task Management
- **Create Tasks**: Add new tasks with a title.
- **Delete Tasks**: Remove completed or unwanted tasks.
- **Status Tracking**: Tasks have a status (default: 'todo').

### 📝 Note Taking
- **Create Notes**: Quickly add text notes.
- **Pin/Unpin**: Pin important notes to the top of the list for easy access.
- **Delete Notes**: Remove notes when they are no longer needed.
- **Optimistic Updates**: The UI updates immediately when pinning/unpinning for a responsive feel.

## Technical Implementation

This project is built with a modern stack to ensure type safety and performance:

### Frontend
- **Next.js App Router**: Uses Server Components for initial data fetching and Client Components for interactivity.
- **Tailwind CSS**: For rapid and responsive styling.
- **React Hooks**: `useState`, `useEffect`, and `useMemo` for managing local state and logic.

### Backend
- **Next.js API Routes**: Custom route handlers (`src/app/api/...`) manage server-side logic.
    - `GET`: Fetch data from the database.
    - `POST`: Create new entries (validated with Zod).
    - `DELETE`: Remove entries.
    - `PATCH`: Update specific fields (e.g., pinning a note).
- **Drizzle ORM**: A lightweight TypeScript ORM for interacting with the PostgreSQL database.
- **PostgreSQL**: The relational database used for storage.

### Validation
- **Zod**: Used to define schemas and validate incoming API requests, ensuring data integrity before it reaches the database.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up the database**:
    Ensure you have a PostgreSQL database running and your `.env` file is configured.
    ```bash
    npm run db:migrate
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000).
