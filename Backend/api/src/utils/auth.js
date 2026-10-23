import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'influencehub_token';
const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export const createAuthToken = (user) =>
  jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export const setAuthCookie = (response, user) => {
  response.cookie(AUTH_COOKIE_NAME, createAuthToken(user), {
    ...authCookieOptions(),
    maxAge: TOKEN_LIFETIME_MS,
  });
};
