// This file is used by the middleware to exempt the debug-auth routes from authentication
export const bypassAuthRoutes = [
  '/debug-auth',
  '/api/auth-status'
];

// Note: This file should be imported in the middleware to add these paths to the public paths

export const config = {
  unstable_allowDynamic: [
    // This page uses dynamic features and should not be statically generated
    '/debug-auth/page.tsx', 
  ],
}; 