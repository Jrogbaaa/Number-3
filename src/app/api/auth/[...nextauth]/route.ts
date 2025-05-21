import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
 
// Export route handlers for NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 