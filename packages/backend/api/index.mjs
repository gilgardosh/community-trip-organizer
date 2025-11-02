/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a serverless function handler.
 * Vercel will automatically deploy this as a serverless function.
 * 
 * Note: We use .mjs to ensure ES modules work correctly with Vercel.
 */

import app from '../dist/src/app.js';

export default app;
