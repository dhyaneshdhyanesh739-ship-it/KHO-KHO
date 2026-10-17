/**
 * Middleware ensuring strict team isolation between BOYS and GIRLS administrative domains.
 * Prevents Insecure Direct Object References (IDOR) and cross-team data access.
 */
export const enforceTeamAccess = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Super admins can oversee both teams
  if (user.role === 'SUPER_ADMIN') {
    // If team requested in query/body/params, use it; otherwise default to ALL
    req.targetTeam = req.params.team || req.query.team || req.body.team || 'ALL';
    return next();
  }

  // Boys Admin can strictly only operate on BOYS team
  if (user.role === 'BOYS_ADMIN') {
    const requestedTeam = req.params.team || req.query.team || req.body.team;
    if (requestedTeam && requestedTeam.toUpperCase() === 'GIRLS') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Boys Admin is strictly prohibited from accessing or modifying Girls Team records.',
      });
    }
    // Force team to BOYS regardless of client payload
    req.targetTeam = 'BOYS';
    if (req.body && req.body.team) req.body.team = 'BOYS';
    return next();
  }

  // Girls Admin can strictly only operate on GIRLS team
  if (user.role === 'GIRLS_ADMIN') {
    const requestedTeam = req.params.team || req.query.team || req.body.team;
    if (requestedTeam && requestedTeam.toUpperCase() === 'BOYS') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Girls Admin is strictly prohibited from accessing or modifying Boys Team records.',
      });
    }
    // Force team to GIRLS regardless of client payload
    req.targetTeam = 'GIRLS';
    if (req.body && req.body.team) req.body.team = 'GIRLS';
    return next();
  }

  // Players can strictly only see their assigned team
  if (user.role === 'PLAYER') {
    const requestedTeam = req.params.team || req.query.team || req.body.team;
    if (requestedTeam && requestedTeam.toUpperCase() !== user.team) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Players can only view information for their registered team.',
      });
    }
    req.targetTeam = user.team;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access forbidden for current user context.',
  });
};

/**
 * Validates that a specific database document belongs to the requesting user's team.
 */
export const assertTeamOwnership = (document, user) => {
  if (!document) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return document.team === user.team;
};
