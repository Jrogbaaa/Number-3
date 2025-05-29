import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Keep the import but we'll comment out its usage
// import { SupabaseAdapter } from "@auth/supabase-adapter";

// Extend the session types to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Override to ensure NEXTAUTH_URL is set
if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'development') {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  console.log('[Auth] NEXTAUTH_URL not set, using default:', process.env.NEXTAUTH_URL);
}

// Print NEXTAUTH_SECRET status for debugging
if (!process.env.NEXTAUTH_SECRET) {
  console.log('[Auth] NEXTAUTH_SECRET is not set! Authentication will not work properly');
} else {
  console.log('[Auth] NEXTAUTH_SECRET is set');
}

// Check Google OAuth credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('[Auth] Google OAuth credentials are missing. Authentication will fail!');
} else {
  console.log('[Auth] Google OAuth credentials are configured');
}

// Add this detailed environment check
console.log("[Auth Config] Environment check:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  // Comment out the Supabase adapter for now to isolate the issue
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  
  // Add cookies configuration for production
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        // Ensure cookies work across subdomains on Vercel
        domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
      },
    },
  },
  
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log(`[Auth] Redirect callback - URL: ${url}, Base URL: ${baseUrl}`);
      
      // If it's a callback URL or sign-in URL, go to dashboard
      if (url.includes('/api/auth/callback') || url.includes('/api/auth/signin')) {
        console.log('[Auth] Auth callback detected, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // If the URL is already the callback URL with an error parameter, keep it
      if (url.includes('/signin?') && url.includes('error=')) {
        console.log('[Auth] Error URL detected, keeping it');
        return url;
      }
      
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If the URL is already absolute and on the same host, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default to the base URL for safety
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log(`[Auth] New sign in for user: ${user.id || 'unknown'}`);
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  logger: {
    error(code, metadata) {
      // Use console.log instead of console.error to prevent NextAuth from re-throwing errors
      console.log('[NextAuth Error]', code, metadata);
    },
    warn(code) {
      console.log('[NextAuth Warning]', code);
    },
    debug(code, metadata) {
      console.log('[NextAuth Debug]', code, metadata);
    }
  }
}; 