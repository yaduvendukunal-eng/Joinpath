import { requireChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { accounts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Joinpath from '@/components/joinpath/JoinpathApp';
export const dynamic = 'force-dynamic';
export default async function Dashboard({ params }: {
    params: Promise<{
        role: string;
    }>;
}) { const { role } = await params; const user = await requireChatGPTUser('/dashboard/' + role); const me = await getDb().select().from(accounts).where(eq(accounts.id, user.userId)).get(); if (!me)
    redirect('/login'); if (me.role !== role)
    redirect('/dashboard/' + me.role); return <Joinpath dashboard/>; }
