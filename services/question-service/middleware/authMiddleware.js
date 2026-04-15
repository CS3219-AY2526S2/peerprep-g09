import firebaseApp from "../config/firebase.js";

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

export const verifyAuthenticated = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required." });
  }

  try {
    const decodedToken = await firebaseApp.auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const verifyAdmin = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required." });
  }

  try {
    const decodedToken = await firebaseApp.auth.verifyIdToken(token);

    if (decodedToken.role !== "Admin") {
      return res.status(403).json({ error: "Admin role is required." });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
