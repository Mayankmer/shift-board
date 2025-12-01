import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET: Fetch shifts based on role
export async function GET(req: Request) {
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  let query = `
    SELECT s.*, u.name as employee_name, u.employee_code 
    FROM shifts s 
    JOIN users u ON s.user_id = u.id
  `;
  const params: any[] = [];

  // RULE: Normal users only see their own shifts
  if (user.role !== 'admin') {
    query += ' WHERE s.user_id = $1';
    params.push(user.id);
  }

  query += ' ORDER BY s.date DESC, s.start_time ASC';

  try {
    const result = await db.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }
}

// POST: Create a new shift (Admin Only)
export async function POST(req: Request) {
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RULE: Only admin can create shifts
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId, date, startTime, endTime } = await req.json();
    const db = getDb();

    // RULE 1: Shift must be >= 4 hours
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (hours < 4) {
      return NextResponse.json({ error: 'Shift must be at least 4 hours' }, { status: 400 });
    }

    // RULE 2: No overlapping shifts for the same user
    // SQL Logic: (StartA < EndB) and (EndA > StartB)
    const overlapCheck = await db.query(`
      SELECT id FROM shifts 
      WHERE user_id = $1 
      AND date = $2
      AND start_time < $3 
      AND end_time > $4
    `, [userId, date, endTime, startTime]);

    if (overlapCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Shift overlaps with existing one' }, { status: 400 });
    }

    // Insert
    const result = await db.query(`
      INSERT INTO shifts (user_id, date, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, date, startTime, endTime]);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}