import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { User } from '../models/User.js';
import { authCookieOptions, AUTH_COOKIE_NAME, setAuthCookie } from '../utils/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const publicRoles = new Set(['Brand', 'Creator']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

router.post('/register', async (request, response) => {
  const { name, email, password, role } = request.body ?? {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (cleanName.length < 2 || cleanName.length > 100) {
    return response.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
  }
  if (cleanEmail.length > 254 || !emailPattern.test(cleanEmail)) {
    return response.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
  }
  if (!publicRoles.has(role)) {
    return response.status(400).json({ error: 'Choose either the Brand or Creator account type.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash, role });
    setAuthCookie(response, user);
    return response.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ error: 'An account with this email already exists.' });
    }
    throw error;
  }
});

router.post('/login', async (request, response) => {
  const { email, password } = request.body ?? {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail || typeof password !== 'string') {
    return response.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password))) {
    return response.status(401).json({ error: 'Email or password is incorrect.' });
  }

  setAuthCookie(response, user);
  return response.json({ user: toPublicUser(user) });
});

router.post('/logout', (_request, response) => {
  response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
  return response.json({ message: 'Signed out.' });
});

router.get('/me', requireAuth, (request, response) =>
  response.json({ user: toPublicUser(request.user) })
);

export default router;
