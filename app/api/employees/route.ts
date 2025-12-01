import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const user = verifyAuth(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  // Only fetch users who are not admins
  const result = await db.query("SELECT id, name, employee_code FROM users WHERE role = 'user'");
  return NextResponse.json(result.rows);
}