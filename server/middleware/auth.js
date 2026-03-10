const jwt = require("jsonwebtoken");

// the “required” guard
function required(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}

// the “optional” guard
function optional(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
    } catch {
      // ignore invalid token
    }
  }

  next();
}

// default export is the required guard (so `router.get('/me', auth, …)` works)
function auth(req, res, next) {
  return required(req, res, next);
}

// attach both to the exported function
auth.required = required;
auth.optional = optional;

module.exports = auth;
