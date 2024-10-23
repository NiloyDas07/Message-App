# SimpleChat

A very simple chat application built with **[Next.js](https://nextjs.org/)**, **[React](https://react.dev/)**, and **[MongoDB](https://www.mongodb.com/)**. Uses AI(llama) for generating message suggestions.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Components](#components)
- [Models](#models)
- [Schemas](#schemas)
- [Authentication](#authentication)

## Features

- User registration and verification via email.
- User authentication using **[Auth.js](https://authjs.dev/)**
- Messaging system with message sending and receiving.
- Stylish responsive UI built using **[shadcn/ui](https://ui.shadcn.com/)**

## Getting Started

1. Clone the repository: `git clone https://github.com/your-username/simple-chat.git`
2. Install dependencies: `npm install` or `yarn install`
3. Set up environment variables in a `.env` file (see [Environment Variables](#environment-variables))
4. Start the development server: `npm run dev` or `yarn dev`

## Project Structure

The project is organized into the following directories:

- `src` : Source code for the application.
- `src/app` : Next.js pages and API routes.
- `src/components` : React components.
- `src/components/ui` : Shadcn UI components.
- `src/context` : Authentication context.
- `src/data` : Initial data for message suggestions.
- `src/helpers` : Utility functions.
- `src/lib` : Utility functions.
- `src/models` : MongoDB models created using **[Mongoose](https://mongoosejs.com/).**
- `src/schemas`: Validation schemas using **[Zod](https://zod.dev/).**
- `src/types` : Type definitions.

## Dependencies

The project uses the following dependencies:

- [next](https://nextjs.org/): Next.js framework.
- [react](https://react.dev/): React library.
- [mongodb](https://www.mongodb.com/): MongoDB database.
- [mongoose](https://mongoosejs.com/): MongoDB ORM.
- [next-auth](https://authjs.dev/): Authentication library.
- [nodemailer](https://nodemailer.com): Email sending library.
- [tailwindcss](https://tailwindcss.com/): CSS framework.
- [zod](https://zod.dev/): Validation library.
- [ai](https://sdk.vercel.ai/): Vercel AI Toolkit for TypeScript.
- [bcryptjs](https://www.npmjs.com/package/bcryptjs): Password hashing library.
- [axios](https://www.npmjs.com/package/axios): HTTP client library.
- [lucide-react](https://lucide.dev/): Icon library.
- [react-email](https://react.email/): Email components.
- [radix-ui](https://www.radix-ui.com/): Specific UI components loaded by `shadcn/ui`.
- [hookform/resolvers](https://react-hook-form.com/): Form validation library used by `shadcn/ui`.

## Environment Variables

The project uses the following environment variables:

- `SMTP_HOST`: SMTP host for email sending
- `SMTP_PORT`: SMTP port for email sending
- `SMTP_SECURE`: SMTP secure connection flag
- `SMTP_USER`: SMTP username for email sending
- `SMTP_PASS`: SMTP password for email sending
- `AUTH_SECRET`: Auth.js Secret key for authentication
- `NEXTAUTH_URL`: Base URL
- `MONGODB_URI`: MongoDB connection URI
- `GROQ_API_KEY`: Groq API key for AI access

## API Endpoints

The project has the following API endpoints:

- `GET /api/accept-messages` : Check user message acceptance status.
- `POST /api/accept-messages` : Update user message acceptance status.
- `GET /api/check-username-unique` : Check if username is unique.
- `DELETE /api/delete-message/[messageId]` : Delete a message.
- `GET /api/get-messages` : Retrieves a list of messages for the authenticated user.
- `GET /api/get-user-by-username/` : Retrieves a user by username.
- `POST /api/send-message` : Sends a new message.
- `GET /api/auth/[...nextauth]` : Authentication endpoint.
- `POST /api/sign-in` : Sign in with email and password.
- `POST /api/sign-up` : Sign up with email and password.
- `POST /api/suggest-messages` : Get AI generated message suggestions.
- `POST /api/verify-code` : Verify email address using OTP.

## Components

The project uses the following components:

- `MessageCard` : Displays a single message.
- `Button` : Button component.
- `Navbar` : Navigation bar component.
- `ThemeToggle` : Theme toggle component.
- The rest are the shadcn UI components which are located in `src/components/ui`.

## Models

The project uses the following MongoDB models:

- `User`: User model
- `Message`: Message model

## Schemas

The project uses the following `zod` validation schemas:

- `messageSchema` : Validates message content.
- `acceptMessageSchema` : Validates message acceptance.
- `signInSchema` : Validates sign in credentials.
- `signUpSchema` : Validates sign up credentials.
- `verifySchema` : Validates verification code.

## Authentication

The project uses NextAuth for authentication. The authentication flow is as follows:

1. User registers with email and password
2. User receives verification email with OTP
3. User verifies email address using OTP
4. User logs in with email and password
