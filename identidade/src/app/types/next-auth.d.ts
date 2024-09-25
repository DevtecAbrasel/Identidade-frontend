// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";

// Definimos o tipo do usuário que inclui accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      is_admin: boolean; // Adiciona is_admin à sessão
      id: string;
      name: string;
      email: string;
    };
  }

  interface User {
    accessToken?: string;
    is_admin: boolean; // Adiciona is_admin à sessão
    id: string;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    email?: string;
    name?: string;
    is_admin: boolean; // Adiciona is_admin à sessão

  }
}
