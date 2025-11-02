/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function handler.
 * Vercel will automatically deploy this as a serverless function.
 * 
 * Important: Do NOT use app.listen() in serverless environments.
 * Vercel handles the server listening automatically.
 */

import app from '../src/app.js';

// Export the Express app as the default handler for Vercel
export default app;
