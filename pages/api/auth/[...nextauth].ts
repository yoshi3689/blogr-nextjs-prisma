import NextAuth, {NextAuthOptions} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import prisma from "../../../lib/prisma";

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
  // secret: process.env.SECRET,
};

export default NextAuth(authOptions);
