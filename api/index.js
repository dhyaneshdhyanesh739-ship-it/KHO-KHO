export default async function handler(req, res) {
  try {
    const { default: app } = await import('../server/src/app.js');
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    return app(req, res);
  } catch (err) {
    console.error('[Vercel API Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Vercel Serverless Function encountered an error during startup',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    });
  }
}

