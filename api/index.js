import app from '../server/src/app.js';

export default function handler(req, res) {
  // Ensure the URL matches Express route prefix /api
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
