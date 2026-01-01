// import admin from "firebase-admin";

// const firebaseAuthMiddleware = async (req, res, next) => {
//   const idToken = req.headers.authorization?.split("Bearer ")[1];

//   if (!idToken) {
//     return res.status(401).json({ error: "Unauthorized: Token missing" });
//   }

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     req.firebaseUser = decodedToken;
    
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Unauthorized: Invalid or Expired token" });
//   }
// };

// export default firebaseAuthMiddleware;
import admin from "firebase-admin";

const firebaseAuthMiddleware = async (req, res, next) => {
  // Ensure Firebase Admin is initialized
  if (!admin.apps || admin.apps.length === 0) {
    return res.status(503).json({ error: "Authentication service not configured" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default firebaseAuthMiddleware;
