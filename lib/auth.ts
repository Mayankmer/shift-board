import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

// Helper function to verify user token in API routes
export const verifyAuth = (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1]; 
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (err) {
    return null;
  }
};