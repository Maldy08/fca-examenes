import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Definimos qué rutas son privadas (Solo docentes)
const isTeacherRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/exams(.*)'
]);

// Definimos qué rutas son de estudiantes
const isStudentRoute = createRouteMatcher([
  '/take-exam(.*)',
  '/boleta(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isTeacherRoute(req)) {
    await auth.protect();
  }

  if (isStudentRoute(req)) {
    const studentSession = req.cookies.get("student_session");
    if (!studentSession?.value) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};