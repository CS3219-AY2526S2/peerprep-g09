const extractInternalServiceKey = (req) => req.headers["x-internal-service-key"];

export const verifyInternalService = (req, res, next) => {
  const providedKey = extractInternalServiceKey(req);
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;

  if (!expectedKey) {
    return res
      .status(500)
      .json({ error: "Internal service authentication is not configured." });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized internal request." });
  }

  next();
};
