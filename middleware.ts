// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Assuming authConfig is correctly defined

// Get the 'auth' function from NextAuth, which is designed for middleware
// This will be a function that handles authentication and returns a Next.js response
const { auth } = NextAuth(authConfig);

// Export the 'auth' function as the default middleware handler
export default auth;

// You still define your matcher here
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};