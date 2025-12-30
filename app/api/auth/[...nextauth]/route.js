import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [
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

        return {
          id: credentials.email,
          accessToken: data.token,
        };
      } catch (err) {
        console.error("Auth error", err);
        return null;
      }
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === 'google') {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const apiUrl = `${baseUrl}/auth/google`;
            console.log('Google Auth: Fetching', apiUrl);

            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: account.id_token })
            });

            console.log('Google Auth: Response status', res.status);

            if (res.ok) {
              const data = await res.json();
              token.accessToken = data.token;
            } else {
              const text = await res.text();
              console.error('Google auth failed on backend:', text.substring(0, 200));
            }
          } catch (error) {
            console.error('Error exchanging google token', error);
          }
        } else {
          token.accessToken = user.accessToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
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
