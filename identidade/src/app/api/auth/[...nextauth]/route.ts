import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import jwt from "jsonwebtoken"; // Para decodificar o JWT
import { serialize } from "cookie";
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Usuário", type: "text", placeholder: "admin" },
        password: { label: "Senha", type: "password", placeholder: "admin" },
      },
      async authorize(credentials) {
        try {
          // Fazendo a chamada para sua API de login
          const response = await axios.post("http://localhost:4002/login", {
            email: credentials?.email,
            password: credentials?.password,
          });

          const token = response.data.token;

          if (token) {
            // Decodificar o token para extrair as informações do usuário
            const decodedToken = jwt.decode(token) as {
              id: string;
              name: string;
              email: string;
              isAdmin: boolean;
            };
            console.log("Token decodificado:", decodedToken);
            if (!decodedToken) {
              throw new Error("Falha ao decodificar o token");
            }

            // Definindo o cookie no navegador
            const cookie = serialize("authToken", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 60 * 60 * 24 * 7, // 1 semana
              path: "/",
            });
            console.log("Cookie:", cookie);
            // Adicionando o cookie ao cabeçalho da resposta

            // Retorna o token e as informações do usuário
            return {
              id: decodedToken.id,
              name: decodedToken.name,
              email: decodedToken.email,
              is_admin: decodedToken.isAdmin, // Inclui is_admin no retorno
              accessToken: token, // O token é armazenado como accessToken
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Se o usuário foi autenticado, armazene o token e informações
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.is_admin = user.is_admin; // Inclui is_admin no JWT
        token.accessToken = user.accessToken;
      }
      console.log(token.is_admin)
      return token;
    },
    // Adiciona o token à sessão e garante que ele será armazenado no cookie
    async session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.name = token.name ?? '';
      session.user.email = token.email ?? '';
      session.user.is_admin = token.is_admin ?? false;
      session.accessToken = token.accessToken; // Retorna o accessToken na sessão
      return session;
    },
  },
  pages: {
    signIn: "/login", // Definimos a página de login
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
