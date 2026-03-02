export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/watch/:path*', '/admin/:path*']
}
