import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login_check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password
            })
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();

          console.log(data);

          // Symfony vrátí { token: "...", refresh_token: "...", ... }
          return {
            id: credentials.email, // nebo ID z backendu
            accessToken: data.token,
          };
        } catch (err) {
          console.error("Auth error", err);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // při prvním loginu
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // zpřístupní JWT v session
      session.accessToken = token.accessToken;
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/prihlaseni" // vlastní login stránka
  }
});

export { handler as GET, handler as POST };
