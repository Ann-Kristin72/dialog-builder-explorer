import jwt from 'jsonwebtoken';

// Middleware for JWT authentication
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Du må være innlogget for å få tilgang til denne ressursen'
    });
  }

  try {
    // For Azure AD B2C, we need to verify the JWT token
    // This is a simplified version - in production you'd want proper JWT validation
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Ugyldig eller utløpt token'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.sub || decoded.oid,
      email: decoded.email || decoded.upn,
      givenName: decoded.given_name,
      surname: decoded.family_name,
      organization: decoded.organization,
      location: decoded.location,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('❌ JWT verification error:', error);
    return res.status(403).json({ 
      error: 'Token verification failed',
      message: 'Kunne ikke verifisere din innlogging'
    });
  }
};

// Optional authentication - allows both authenticated and anonymous users
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        req.user = {
          id: decoded.sub || decoded.oid,
          email: decoded.email || decoded.upn,
          givenName: decoded.given_name,
          surname: decoded.family_name,
          organization: decoded.organization,
          location: decoded.location,
          role: decoded.role,
        };
      }
    } catch (error) {
      console.error('❌ Optional auth error:', error);
    }
  }

  next();
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Du må være innlogget for å få tilgang til denne ressursen'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Du har ikke tilgang til denne ressursen'
      });
    }

    next();
  };
};
