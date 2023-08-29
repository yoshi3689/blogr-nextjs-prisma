import NextAuth, {NextAuthOptions} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma";

const testProvider = [
  CredentialsProvider({
  name: "Credentials",
  credentials: {
    username: {
      label: "Username",
      type: "text",
      placeholder: "jsmith",
    },
    password: { label: "Password", type: "password" },
  },
  //@ts-ignore
  async authorize() {
    return {
      id: 1,
      name: "J Smith",
      email: "jsmith@example.com",
      image: "https://i.pravatar.cc/150?u=jsmith@example.com",
    }
  },
})
]

const oAuthProviders = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    // to force create refresh token by google oauth
    authorization: {
      params: {
        prompt: "consent",
      },
    },
  })
];

const authOptions: NextAuthOptions = {
  providers: process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development"
    ? testProvider
    : oAuthProviders
  ,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin";
      return token;
    },
  },
  // secret: process.env.SECRET,
};

export default NextAuth(authOptions);
