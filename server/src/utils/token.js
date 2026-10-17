import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'super_secure_kho_kho_arena_jwt_secret_key_2026_dev_random_salt_99';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      team: user.team,
      playerRef: user.playerRef,
    },
    secret,
    { expiresIn }
  );
};

export const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
};

export const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: isProd ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};
