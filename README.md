# Palworld Web Application

This is the frontend for the Palworld application, built with [Next.js](https://nextjs.org). It provides a web interface for managing Palworld creatures (Pals) and their passive skills.

## Features

- Add new Pals with their details and passive skills
- View stored Pals with filtering and pagination
- Manage passive skills and combinations
- Responsive design with modern UI

## Backend Connection

This frontend connects to the `palworld_app` Go backend. Make sure to configure the backend URL properly:

- **Development**: `http://localhost:8080`
- **Production**: Set `NEXT_PUBLIC_BACKEND_API_URL` to your deployed backend URL

See the [Deployment Guide](../../DEPLOYMENT.md) for detailed setup instructions.

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Backend API URL
BACKEND_API_URL=http://localhost:8080
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
```

For production deployment, update these URLs to point to your deployed backend.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
