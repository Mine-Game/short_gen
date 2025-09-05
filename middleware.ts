import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('next-auth.session-token')?.value || req.cookies.get('__Secure-next-auth.session-token')?.value

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/login' && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.delete('from')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/auth/sign-in']
}


