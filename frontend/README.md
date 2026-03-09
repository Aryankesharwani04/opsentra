# Opsentra Frontend

This folder will contain the Opsentra frontend application.

## Planned Stack
- **Framework**: React (with Vite) or Next.js
- **Styling**: Tailwind CSS / Vanilla CSS
- **State**: Zustand / Redux Toolkit
- **API Client**: Axios with interceptors

## Getting Started

```bash
# When ready, bootstrap with:
npx create-vite@latest . --template react

# Or Next.js:
npx create-next-app@latest . --typescript
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Backend

The backend API is in the `../opsentra/` folder.

```bash
cd ../opsentra
cp .env.example .env
npm install
npm run dev
```
