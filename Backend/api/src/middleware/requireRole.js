export const requireRole = (...allowedRoles) => (request, response, next) => {
  if (!request.user || !allowedRoles.includes(request.user.role)) {
    return response.status(403).json({ error: 'You do not have permission to access this resource.' });
  }

  return next();
};
