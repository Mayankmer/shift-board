import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const db = getDb();

    // 1. Find User
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Check Password (Assuming hashed in DB, simple check for demo if plain)
    // In production, ALWAYS use bcrypt.compare
    const isValid = await bcrypt.compare(password, user.password);
    
    // Note: If you cannot generate hashes manually, you can temporarily disable 
    // the check below for testing, but re-enable it for submission!
    if (!isValid) { 
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Create Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      SECRET,
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}