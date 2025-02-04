import {  clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home",
])
const isPublicApiRoute = createRouteMatcher([
    "/api/videos",
])

export default clerkMiddleware( async(auth, req) => {
    const {userId} =await auth();
    const currentUrl =new URL(req.url)
    const isAccessingDashboard = currentUrl.pathname === "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")

    if (userId && isPublicApiRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url))
    }
    // If the user is not signed in
    if (!userId) {
        //if the user is not signed in and trying to access the protected route
        if (!isPublicApiRoute(req) && !isPublicRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }
        // if the request is for a protected api route and the user is not signed in
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }
    }

    return NextResponse.next()

})

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"
    ],
}