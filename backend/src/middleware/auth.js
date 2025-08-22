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
    // Note: In production, you should validate the token signature with Azure AD B2C public keys
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Ugyldig eller utløpt token'
      });
    }

    // Validate token structure (basic validation)
    if (!decoded.sub || !decoded.iss || !decoded.aud) {
      return res.status(403).json({ 
        error: 'Invalid token structure',
        message: 'Token har ugyldig struktur'
      });
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(403).json({ 
        error: 'Token expired',
        message: 'Token har utløpt'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.sub || decoded.oid,
      email: decoded.email || decoded.upn,
      givenName: decoded.given_name || decoded.name,
      surname: decoded.family_name,
      organization: decoded.extension_Organization || decoded.organization,
      location: decoded.extension_Location || decoded.location,
      role: decoded.extension_Role || decoded.role,
      tenantId: decoded.tid, // Azure AD tenant ID
      issuer: decoded.iss, // Token issuer
    };

    console.log('✅ User authenticated:', req.user.email);
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
        // Basic validation
        if (decoded.sub && decoded.iss && decoded.aud) {
          // Check if token is expired
          if (!decoded.exp || Date.now() < decoded.exp * 1000) {
            req.user = {
              id: decoded.sub || decoded.oid,
              email: decoded.email || decoded.upn,
              givenName: decoded.given_name || decoded.name,
              surname: decoded.family_name,
              organization: decoded.extension_Organization || decoded.organization,
              location: decoded.extension_Location || decoded.location,
              role: decoded.extension_Role || decoded.role,
              tenantId: decoded.tid,
              issuer: decoded.iss,
            };
            console.log('✅ Optional auth: User authenticated:', req.user.email);
          } else {
            console.log('⚠️ Optional auth: Token expired, continuing as anonymous');
          }
        }
      }
    } catch (error) {
      console.error('❌ Optional auth error:', error);
    }
  } else {
    console.log('ℹ️ Optional auth: No token provided, continuing as anonymous');
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
