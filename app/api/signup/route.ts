import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, employee_code } = await req.json();
    
    // Basic Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = getDb();

    // 1. Check if email already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert User (Always as 'user' role for safety)
    const result = await db.query(`
      INSERT INTO users (name, email, password, role, employee_code, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role
    `, [name, email, hashedPassword, 'user', employee_code || 'EMP-NEW', 'General']);

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}