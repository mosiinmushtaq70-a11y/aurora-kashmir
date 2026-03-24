import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Pass-through middleware — no session auth required for this project.
  // Supabase data is accessed via Server Actions which run in Node.js runtime.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
