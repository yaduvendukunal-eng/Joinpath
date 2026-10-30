import { apiFailure } from '../../../lib/joinpath/api-failure';
import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { accounts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
async function handleGet() { const user = await getChatGPTUser(); if (!user)
    return json({ user: null, account: null }); const db = getDb(); const account = await db.select().from(accounts).where(eq(accounts.id, user.userId)).get(); return json({ user: { name: user.displayName, email: user.email }, account: account || null }); }
async function handlePost(req: Request) { const user = await getChatGPTUser(); if (!user)
    return json({ error: 'Please sign in.' }, 401); if (req.headers.get('origin') !== new URL(req.url).origin)
    return json({ error: 'Invalid origin' }, 403); const db = getDb(); const existing = await db.select().from(accounts).where(eq(accounts.id, user.userId)).get(); if (existing) {
    await db.update(accounts).set({ lastLogin: new Date().toISOString() }).where(eq(accounts.id, user.userId));
    return json({ role: existing.role });
} let body: any; try {
    body = await req.json();
}
catch {
    return json({ error: 'Invalid request' }, 400);
} if (!body || !['student', 'company', 'college'].includes(body.role) || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100 || typeof body.organization !== 'string' || body.organization.length > 120)
    return json({ error: 'Please complete your account details.' }, 400); if (body.role !== 'student' && !body.organization.trim())
    return json({ error: 'Enter your organization name.' }, 400); const now = new Date().toISOString(); await db.insert(accounts).values({ id: user.userId, email: user.email, name: body.name.trim(), organization: body.organization.trim(), role: body.role, createdAt: now, lastLogin: now }); return json({ role: body.role }); }

export async function GET() { try { return await handleGet(); } catch (error) { return apiFailure(error); } }
export async function POST(request: Request) { try { return await handlePost(request); } catch (error) { return apiFailure(error); } }
