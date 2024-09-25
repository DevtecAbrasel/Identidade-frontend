import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Defina a chave secreta do JWT
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  // Obter o token JWT para a sessão ativa
  const token = await getToken({ req, secret });
  
  // Verifica se o token existe e se o usuário é um administrador
  if (token && token.is_admin) {
    // Se o usuário for admin, permita a continuação da requisição
    return NextResponse.next();
  } else {
    // Redireciona para a página de acesso negado se o usuário não for admin
    return NextResponse.redirect(new URL('/access-denied', req.url));
  }
}

// Definir as rotas protegidas
export const config = {
  matcher: ['/admin/:path*', '/create-user'], // Rotas que requerem privilégio de admin
};
