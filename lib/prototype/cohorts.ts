import { permitted, type Actor, type State } from './model';
export type CohortMember = { id: string; name: string; offerId: string; reasons: string[]; delayed: boolean; pending: boolean; joined: boolean; learningShared: boolean; lastUpdate: string; activity: string | null };
export type Cohort = { key: string; company: string; college: string; role: string; month: string; members: CohortMember[] };
export function cohorts(state: State, actor: Actor, now = Date.now()): Cohort[] {
  if (actor.role === 'student') return [];
  const groups = new Map<string,Cohort>();
  for (const o of state.offers) {
    const s = state.students.find(s => s.id === o.studentId);
    if (!s || !permitted(s, actor, 'joining') || (actor.role === 'company' ? o.companyId !== actor.id : s.collegeId !== actor.id) || o.status === 'Withdrawn') continue;
    const profile = permitted(s, actor, 'profile');
    const college = actor.role === 'college' || profile ? s.collegeId : 'Not shared';
    const month = /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? o.date.slice(0,7) : 'Unscheduled';
    const key = JSON.stringify([o.companyId,college,o.title,month]);
    const g = groups.get(key) || { key, company:o.companyId,college,role:o.title,month,members:[] };
    const learningShared = permitted(s,actor,'learning');
    const reasons:string[]=[];
    if(o.status !== 'Joined' && o.response !== 'Declined') {
      const days = Math.floor((now-Date.parse(s.lastActivity))/86400000);
      if(learningShared && days >= 21) reasons.push(`No learning activity for ${days} days`);
      const unanswered=o.requests.filter(r=>!r.answered && now-Date.parse(r.at)>=2*86400000).length;
      if(unanswered>=2) reasons.push(`${unanswered} confirmation requests unanswered for at least 48 hours`);
    }
    g.members.push({id:s.id,name:profile?s.name:'Student · identity not shared',offerId:o.id,reasons,delayed:o.status==='Deferred',pending:o.response==='Pending'&&o.status!=='Joined',joined:o.status==='Joined',learningShared,lastUpdate:o.history.at(-1)?.at||'',activity:learningShared?s.lastActivity:null});
    groups.set(key,g);
  }
  return [...groups.values()].sort((a,b)=>a.month.localeCompare(b.month)||a.role.localeCompare(b.role));
}
export const studentCount = (members: CohortMember[]) => new Set(members.map(m=>m.id)).size;
