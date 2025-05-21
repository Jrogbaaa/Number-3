import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: {
    strategy: "jwt",
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
      // Redirect to dashboard after sign in
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin/error",
  },
}; 