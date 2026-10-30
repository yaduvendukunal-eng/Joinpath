import { apiFailure } from '../../../lib/joinpath/api-failure';
import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { accounts, consentEvents } from '../../../db/schema';
import { eq, or, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
async function handleGet() {
    const user = await getChatGPTUser();
    if (!user)
        return json({ error: 'Sign in required' }, 401);
    const db = getDb();
    const me = await db.select().from(accounts).where(eq(accounts.id, user.userId)).get();
    if (!me)
        return json({ error: 'Complete your account first' }, 403);
    const directory = await db.select({ id: accounts.id, name: accounts.organization, role: accounts.role }).from(accounts).where(or(eq(accounts.role, 'company'), eq(accounts.role, 'college')));
    if (me.role === 'student') {
        const audit = await db.select().from(consentEvents).where(eq(consentEvents.userId, me.id)).orderBy(desc(consentEvents.createdAt)).limit(10);
        return json({ me, directory, audit, candidates: [] });
    }
    const linked = await db.select().from(accounts).where(me.role === 'company' ? eq(accounts.employerId, me.id) : eq(accounts.collegeId, me.id));
    const candidates = linked.filter(x => x.role === 'student').flatMap(s => { const c = JSON.parse(s.consent)[me.role] || {}; if (!c.profile && !c.learning && !c.joining)
        return []; const completed = JSON.parse(s.completed); return [{ id: s.id, name: c.profile ? s.name : 'Student · details private', email: c.profile ? s.email : null, organization: c.profile ? s.organization : null, jobRole: c.profile ? s.jobRole : null, progress: c.learning ? completed.filter((id: string) => ['01', '02', '03', '04'].includes(id)).length * 25 : null, lastActivity: c.learning ? s.lastActivity : null, joiningStatus: c.joining ? s.joiningStatus : null, joiningDate: c.joining ? s.joiningDate : null, dateReason: c.joining ? s.dateReason : null, canUpdateJoining: me.role === 'company' && !!c.joining, signal: c.learning && Date.now() - Date.parse(s.lastActivity || s.createdAt) > 21 * 86400000 ? 'No learning activity for 21+ days' : c.learning ? 'No inactivity flag' : 'Learning activity private' }]; });
    return json({ me, directory, candidates, audit: [] });
}
async function handlePost(req: Request) {
    const user = await getChatGPTUser();
    if (!user)
        return json({ error: 'Sign in required' }, 401);
    if (req.headers.get('origin') !== new URL(req.url).origin)
        return json({ error: 'Invalid origin' }, 403);
    const db = getDb();
    const me = await db.select().from(accounts).where(eq(accounts.id, user.userId)).get();
    if (!me)
        return json({ error: 'Complete your account first' }, 403);
    let b: any;
    try {
        b = await req.json();
    }
    catch {
        return json({ error: 'Invalid request' }, 400);
    }
    if (!b || typeof b !== 'object')
        return json({ error: 'Invalid request' }, 400);
    const now = new Date().toISOString();
    if (b.action === 'consent') {
        if (me.role !== 'student')
            return json({ error: 'Student access required' }, 403);
        const clean: any = {};
        for (const role of ['company', 'college']) {
            clean[role] = {};
            for (const field of ['profile', 'learning', 'joining']) {
                if (typeof b.choices?.[role]?.[field] !== 'boolean')
                    return json({ error: 'Invalid consent choice' }, 400);
                clean[role][field] = b.choices[role][field];
            }
        }
        for (const [key, role] of [['employerId', 'company'], ['collegeId', 'college']]) {
            if (b[key]) {
                const p = await db.select().from(accounts).where(eq(accounts.id, b[key])).get();
                if (p?.role !== role)
                    return json({ error: 'Choose a valid recipient' }, 400);
            }
            if (Object.values(clean[role]).some(Boolean) && !b[key])
                return json({ error: 'Choose a recipient before sharing' }, 400);
        }
        const changedEmployer = (b.employerId || null) !== me.employerId;
        await db.batch([db.update(accounts).set({ consent: JSON.stringify(clean), employerId: b.employerId || null, collegeId: b.collegeId || null, ...(changedEmployer ? { joiningDate: null, joiningStatus: 'No offer yet', dateReason: null, history: '[]' } : {}) }).where(eq(accounts.id, me.id)), db.insert(consentEvents).values({ id: crypto.randomUUID(), userId: me.id, choices: JSON.stringify({ choices: clean, employerId: b.employerId || null, collegeId: b.collegeId || null }), createdAt: now, version: '1.0' })]);
        return json({ ok: true });
    }
    if (b.action === 'complete') {
        if (me.role !== 'student' || !['01', '02', '03', '04', 'consent', 'joining'].includes(b.module))
            return json({ error: 'Not permitted' }, 403);
        if (b.completed !== undefined && typeof b.completed !== 'boolean') return json({ error: 'Completion must be true or false' }, 400);
        const current: string[] = JSON.parse(me.completed);
        const done = b.completed === false ? current.filter(id => id !== b.module) : [...new Set([...current, b.module])];
        await db.update(accounts).set({ completed: JSON.stringify(done), ...(['01', '02', '03', '04'].includes(b.module) ? { lastActivity: now } : {}) }).where(eq(accounts.id, me.id));
        return json({ ok: true });
    }
    if (b.action === 'confirm') {
        if (me.role !== 'student' || !me.joiningDate)
            return json({ error: 'A company must provide a joining date first' }, 400);
        await db.update(accounts).set({ joiningStatus: 'Confirmed', history: JSON.stringify([...JSON.parse(me.history), { at: now, title: 'Joining confirmed', detail: 'Student confirmed the joining date.' }]) }).where(eq(accounts.id, me.id));
        return json({ ok: true });
    }
    if (b.action === 'offer') {
        if (me.role !== 'company')
            return json({ error: 'Company access required' }, 403);
        const student = await db.select().from(accounts).where(eq(accounts.id, b.studentId)).get();
        if (!student || student.employerId !== me.id || !JSON.parse(student.consent).company?.joining)
            return json({ error: 'Student has not authorized joining information sharing' }, 403);
        if (typeof b.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || isNaN(Date.parse(b.date)) || typeof b.reason !== 'string' || !b.reason.trim() || b.reason.length > 500)
            return json({ error: 'Provide a valid date and reason' }, 400);
        await db.update(accounts).set({ joiningDate: b.date, joiningStatus: student.joiningDate ? 'Deferred' : 'Awaiting reply', dateReason: b.reason, history: JSON.stringify([...JSON.parse(student.history), { at: now, title: student.joiningDate ? 'Joining date updated' : 'Joining date provided', detail: b.date + ' — ' + b.reason }]) }).where(eq(accounts.id, student.id));
        return json({ ok: true });
    }
    return json({ error: 'Unknown action' }, 400);
}

export async function GET() { try { return await handleGet(); } catch (error) { return apiFailure(error); } }
export async function POST(request: Request) { try { return await handlePost(request); } catch (error) { return apiFailure(error); } }
