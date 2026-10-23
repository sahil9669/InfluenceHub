import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from '../utils/auth.js';
import { User } from '../models/User.js';

export const requireAuth = async (request, response, next) => {
  const token = request.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return response.status(401).json({ error: 'Sign in to continue.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return response.status(401).json({ error: 'Your session is invalid or has expired.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return response.status(401).json({ error: 'Your account could not be found.' });
  }

  request.user = user;
  return next();
};
