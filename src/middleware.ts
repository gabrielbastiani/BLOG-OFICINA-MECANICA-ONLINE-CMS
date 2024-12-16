import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/recovery_password',
  "/"
];
const PROTECTED_ROUTES = [
  '/marketing_contents/configurations_marketing',
  '/marketing_contents/add_content_marketing',
  '/marketing_contents/all_marketing_contents',
  '/marketing_contents',
  '/user/users_blog',
  '/posts/comments',
  '/posts/all_posts/post',
  '/posts/all_posts',
  '/posts/add_post',
  '/posts',
  '/tags',
  '/tags/all_tags',
  '/categories',
  '/categories/add_category',
  '/categories/all_categories',
  '/newsletter',
  '/dashboard',
  '/user/profile',
  '/user/all_users',
  '/user/add_user',
  '/contacts_form/all_contacts',
  '/central_notifications'
]; // Rotas que requerem autenticação
const ROLE_BASED_ROUTES = {
  SUPER_ADMIN: [
    '/marketing_contents/configurations_marketing',
    '/marketing_contents/add_content_marketing',
    '/marketing_contents/all_marketing_contents',
    '/marketing_contents',
    '/user/users_blog',
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/tags',
    '/tags/all_tags',
    '/categories',
    '/categories/add_category',
    '/categories/all_categories',
    '/newsletter',
    '/dashboard',
    '/user/profile',
    '/user/all_users',
    '/user/add_user',
    '/contacts_form/all_contacts',
    '/central_notifications'
  ], // Exemplo de rotas restritas para SUPER_ADMIN
  ADMIN: [
    '/marketing_contents/add_content_marketing',
    '/marketing_contents/all_marketing_contents',
    '/marketing_contents',
    '/user/users_blog',
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/tags',
    '/tags/all_tags',
    '/categories',
    '/categories/add_category',
    '/categories/all_categories',
    '/dashboard',
    '/newsletter',
    '/user/profile',
    '/user/all_users',
    '/user/add_user',
    '/contacts_form/all_contacts',
    '/central_notifications'
  ], // Exemplo de rotas para ADMIN
  EMPLOYEE: [
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/dashboard',
    '/categories/all_categories',
    '/user/profile',
    '/central_notifications'
  ], // Exemplo de rotas para EMPLOYEE
};

export async function middleware(req: NextRequest) {

  const token = req.cookies.get('@cmsblog.token')?.value;

  if (!token) {
    // Se o token não existir, redirecionar o usuário para a página de login
    if (PROTECTED_ROUTES.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Decodificar o token
  let decodedToken: any;
  try {
    decodedToken = jwt.decode(token);
  } catch (error) {
    // Se o token for inválido ou expirado, redirecionar para a página de login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se o usuário tentar acessar /login, /register ou /recovery_password com token válido
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Verificar se o usuário tem permissão para acessar a rota atual
  const userRole = decodedToken.role; // Supondo que o campo 'role' existe no token

  if (!userRole || !hasAccessToRoute(userRole, req.nextUrl.pathname)) {
    // Se o usuário não tiver permissão para a rota, redirecionar para página inicial
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Função para verificar se o usuário tem permissão para a rota
function hasAccessToRoute(userRole: string, pathname: string): boolean {/* @ts-ignore */
  const allowedRoutes = ROLE_BASED_ROUTES[userRole];
  return allowedRoutes ? allowedRoutes.includes(pathname) : false;
}

export const config = {
  matcher: [
    '/',
    '/marketing_contents/configurations_marketing',
    '/marketing_contents/add_content_marketing',
    '/marketing_contents/all_marketing_contents',
    '/marketing_contents',
    '/user/users_blog',
    '/posts/comments',
    '/posts/all_posts/post',
    '/posts/all_posts',
    '/posts/add_post',
    '/posts',
    '/tags/all_tags',
    '/tags',
    '/categories',
    '/categories/add_category',
    '/categories/all_categories',
    '/newsletter',
    '/dashboard',
    '/user/profile',
    '/login',
    '/register',
    '/recovery_password',
    '/user/all_users',
    '/user/add_user',
    '/contacts_form/all_contacts',
    '/central_notifications'
  ]
};