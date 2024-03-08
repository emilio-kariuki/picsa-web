import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    '/',
    '/privacy',
    '/api/v1/event',
    '/api/v1/guest',
    '/api/v1/guest/join',
    '/api/v1/guest/leave',
    '/api/v1/guest/people',
    '/api/v1/images',
    '/api/v1/insights',
    '/api/v1/images/event',
    '/api/v1/images/url',
    '/api/v1/images/user',
    '/api/v1/upload',
    '/api/v1/user',
    '/sign-in',
    '/sign-up'

  ],
  signInUrl: '/sign-in',
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
