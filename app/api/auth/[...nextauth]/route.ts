import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import isEmail from "validator/lib/isEmail";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
    
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        console.log("nextauth");
        const user = await prisma.asymmetri.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          return null;
        }
        if(!isEmail(user?.email)){
          return null;
        }
        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.email
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  
// cookies: {
//     sessionToken: {
//       name: `__Secure-next-auth.session-token`,
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: process.env.NODE_ENV === 'production'
//       }
//     }
// }
  
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
