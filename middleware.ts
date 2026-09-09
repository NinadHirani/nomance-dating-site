import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const isPlaceholder = !supabaseUrl || 
      !supabaseAnonKey || 
      supabaseUrl.includes('placeholder') || 
      supabaseAnonKey.includes('YOUR_ANON_KEY') || 
      supabaseAnonKey === 'placeholder-key'

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isPublicAsset = request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
    const isGuestMode = request.cookies.get('nomance_guest_mode')?.value === 'true'

    // If in guest mode, placeholder credentials, or no real backend configured, allow access
    if (isGuestMode || isPlaceholder) {
        return supabaseResponse
    }

    const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))
    if (!hasAuthCookie) {
        if (!isAuthPage && !isPublicAsset) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({ request })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Protect with 3 second timeout so network issues never block page rendering
        const getUserPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<any>((resolve) => 
            setTimeout(() => resolve({ data: { user: null }, error: new Error('Timeout') }), 3000)
        )
        const { data: { user } } = await Promise.race([getUserPromise, timeoutPromise])

        if (!user && !isAuthPage && !isPublicAsset) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'
            return NextResponse.redirect(url)
        }

        if (user && isAuthPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/social'
            return NextResponse.redirect(url)
        }
    } catch (error) {
        console.warn("Supabase auth middleware error (allowing page render):", error)
        return supabaseResponse
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}