export type Role = 'student' | 'company' | 'college';
export type Actor = { id: string; name: string; role: Role };
export const actors: Actor[] = [
  { id: 's1', name: 'Aarav Sharma', role: 'student' }, { id: 's2', name: 'Ananya Rao', role: 'student' },
  { id: 'c1', name: 'Acme Technologies', role: 'company' }, { id: 'c2', name: 'Nova Labs', role: 'company' },
  { id: 'u1', name: 'RV Placement Cell', role: 'college' },
];
export type Category = 'profile' | 'skills' | 'learning' | 'joining';
export const categories: Category[] = ['profile', 'skills', 'learning', 'joining'];
export type Skill = { id: string; name: string; level: number; evidence: string; assessed: string; collegeId: string };
export type Student = { id: string; name: string; collegeId: string; skills: Skill[]; permissions: Record<string, Category[]>; lastActivity: string };
export type Vacancy = { id: string; companyId: string; title: string; requirements: { name: string; level: number }[]; shortlisted: string[]; open: boolean };
export type Offer = { id: string; studentId: string; companyId: string; vacancyId: string; title: string; date: string; status: 'Issued' | 'Deferred' | 'Joined' | 'Withdrawn'; response: 'Pending' | 'Accepted' | 'Declined'; requests: { id: string; at: string; answered: boolean }[]; history: { at: string; text: string }[]; joinedAt?: string };
export type Task = { id: string; offerId: string; title: string; criteria: string; skill: string; checked: boolean; state: 'Not submitted' | 'Submitted' | 'Verified' | 'Needs revision'; evidence: string; feedback: string; reviewedBy?: string; submittedAt?: string };
export type Case = { id: string; studentId: string; offerId: string; collegeId: string; companyId: string; subject: string; messages: { by: string; text: string; at: string }[]; closed: boolean };
export type State = { version: 1; students: Student[]; vacancies: Vacancy[]; offers: Offer[]; tasks: Task[]; cases: Case[]; audit: { at: string; by: string; text: string }[] };
export const actorName = (id: string) => actors.find(a => a.id === id)?.name || id;
const day = 86400000;
export const stamp = () => new Date().toISOString();
export function seed(now = Date.now()): State {
  const ago = (days: number) => new Date(now - days * day).toISOString();
  const future = (days: number) => new Date(now + days * day).toISOString().slice(0, 10);
  const permissions = { c1: [...categories], c2: [...categories], u1: [...categories] };
  return { version: 1,
    students: [
      { id: 's1', name: 'Aarav Sharma', collegeId: 'u1', permissions: structuredClone(permissions), lastActivity: ago(2), skills: [
        { id: 'k1', name: 'JavaScript', level: 3, evidence: 'Faculty assessment: async functions and array operations, 8/10.', assessed: ago(6).slice(0,10), collegeId: 'u1' },
        { id: 'k2', name: 'Git', level: 2, evidence: 'Lab review: feature branch and peer-reviewed pull request.', assessed: ago(6).slice(0,10), collegeId: 'u1' }] },
      { id: 's2', name: 'Ananya Rao', collegeId: 'u1', permissions: structuredClone(permissions), lastActivity: ago(23), skills: [
        { id: 'k3', name: 'SQL', level: 3, evidence: 'Department practical: joins, grouping, and data validation.', assessed: ago(10).slice(0,10), collegeId: 'u1' },
        { id: 'k4', name: 'Python', level: 2, evidence: 'Faculty-reviewed CSV cleaning project.', assessed: ago(10).slice(0,10), collegeId: 'u1' }] }],
    vacancies: [
      { id: 'v1', companyId: 'c1', title: 'Graduate Software Engineer', requirements: [{ name: 'JavaScript', level: 2 }, { name: 'Git', level: 2 }, { name: 'SQL', level: 1 }], shortlisted: [], open: true },
      { id: 'v2', companyId: 'c2', title: 'Junior Data Analyst', requirements: [{ name: 'SQL', level: 2 }, { name: 'Python', level: 2 }], shortlisted: [], open: true }],
    offers: [
      { id: 'o1', studentId: 's1', companyId: 'c1', vacancyId: 'v1', title: 'Graduate Software Engineer', date: future(21), status: 'Deferred', response: 'Pending', requests: [{ id: 'r1', at: ago(7), answered: false }, { id: 'r2', at: ago(3), answered: false }], history: [{ at: ago(20), text: 'Offer issued by Acme Technologies.' }, { at: ago(7), text: 'Employer deferred joining by 14 days: onboarding batch rescheduled.' }] },
      { id: 'o2', studentId: 's1', companyId: 'c2', vacancyId: 'v2', title: 'Junior Data Analyst', date: future(30), status: 'Issued', response: 'Pending', requests: [], history: [{ at: ago(5), text: 'Offer issued by Nova Labs.' }] },
      { id: 'o3', studentId: 's2', companyId: 'c1', vacancyId: 'v1', title: 'Graduate Software Engineer', date: ago(1).slice(0,10), status: 'Issued', response: 'Accepted', requests: [], history: [{ at: ago(30), text: 'Sample offer issued by Acme Technologies.' }, { at: ago(8), text: 'Student confirmed intention to join.' }] }],
    tasks: [{ id: 't1', offerId: 'o1', title: 'JavaScript practical', skill: 'JavaScript', criteria: 'Build a small task list with input validation. Explain async behavior and include a README with one limitation.', checked: false, state: 'Not submitted', evidence: '', feedback: '' },
      { id: 't2', offerId: 'o1', title: 'Git collaboration', skill: 'Git', criteria: 'Create a feature branch, make a focused commit, and submit a pull request explaining the change.', checked: false, state: 'Not submitted', evidence: '', feedback: '' },
      { id: 't3', offerId: 'o1', title: 'SQL foundations', skill: 'SQL', criteria: 'Create two related tables, write a join query, and explain how missing values are handled.', checked: false, state: 'Not submitted', evidence: '', feedback: '' }], cases: [], audit: [{ at: ago(20), by: 'Demo setup', text: 'Fictional students opted into sample sharing. New permission choices are explicit; reset restores this demonstration.' }] };
}
export function permitted(s: Student, actor: Actor, category: Category) {
  return actor.id === s.id || Boolean(s.permissions[actor.id]?.includes(category));
}
export function matching(s: Student, v: Vacancy) {
  const details = v.requirements.map(r => {
    const skill = s.skills.find(k => k.name.trim().toLowerCase() === r.name.trim().toLowerCase());
    return { ...r, actual: skill?.level || 0, met: Boolean(skill && skill.level >= r.level) };
  });
  const met = details.filter(d => d.met).length;
  return { details, met, total: details.length, percent: details.length ? Math.round(met / details.length * 100) : 0 };
}
export function signals(s: Student, offers: Offer[], actor: Actor, now = Date.now()) {
  const result: string[] = [];
  if (permitted(s, actor, 'learning')) {
    const days = Math.floor((now - Date.parse(s.lastActivity)) / day);
    if (days >= 21) result.push(`No learning activity for ${days} days`);
  }
  if (permitted(s, actor, 'joining')) for (const o of offers.filter(o => o.studentId === s.id && (actor.role !== 'company' || o.companyId === actor.id) && o.status !== 'Joined' && o.status !== 'Withdrawn')) {
    const unanswered = o.requests.filter(r => !r.answered && now - Date.parse(r.at) >= 2 * day).length;
    if (unanswered >= 2) result.push(`${o.title}: ${unanswered} confirmation requests unanswered for at least 48 hours`);
    if (o.status === 'Deferred') result.push(`${o.title}: employer deferred joining`);
  }
  return result;
}
function ensure(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
function text(value: unknown, max = 500) { ensure(typeof value === 'string' && value.trim() && value.length <= max, 'Please provide a valid value.'); return value.trim(); }
function date(value: unknown) { const d = text(value, 10); ensure(/^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d, 'Use a valid calendar date.'); return d; }
export type Command = { type: string; [key: string]: unknown };
export function update(state: State, actor: Actor, action: Command, now = stamp()): State {
  const next = structuredClone(state);
  const student = (id: unknown) => { const s = next.students.find(s => s.id === id); ensure(s, 'Student not found.'); return s; };
  const offer = () => { const o = next.offers.find(o => o.id === action.offerId); ensure(o, 'Offer not found.'); return o; };
  const companyOffer = () => { const o = offer(); ensure(actor.role === 'company' && o.companyId === actor.id && permitted(student(o.studentId), actor, 'joining'), 'Joining access is not granted to this company.'); return o; };
  const id = () => crypto.randomUUID();
  const log = (message: string) => next.audit.unshift({ at: now, by: actor.name, text: message });
  switch (action.type) {
    case 'consent': {
      ensure(actor.role === 'student', 'Student action only.'); const s = student(actor.id);
      ensure(actors.some(a => a.id === action.recipient && a.role !== 'student'), 'Invalid recipient.');
      ensure(Array.isArray(action.categories) && action.categories.every(c => categories.includes(c)), 'Invalid permissions.');
      s.permissions[String(action.recipient)] = [...new Set(action.categories as Category[])]; log(`Updated sharing with ${actorName(String(action.recipient))}: ${s.permissions[String(action.recipient)].join(', ') || 'all off'}.`); break;
    }
    case 'skill': {
      const s = student(action.studentId); ensure(actor.role === 'college' && s.collegeId === actor.id && permitted(s, actor, 'skills'), 'Student has not allowed your college to manage skills.');
      const name = text(action.name, 60); const level = Number(action.level); ensure(Number.isInteger(level) && level >= 1 && level <= 3, 'Choose a skill level from 1 to 3.');
      const assessed = date(action.assessed); ensure(assessed <= now.slice(0,10), 'Assessment date cannot be in the future.');
      const record = { id: id(), name, level, assessed, evidence: text(action.evidence), collegeId: actor.id };
      const existing = s.skills.findIndex(k => k.name.toLowerCase() === name.toLowerCase());
      if (existing >= 0) s.skills[existing] = record; else s.skills.push(record);
      log(`Recorded ${name} assessment for ${s.name}.`); break;
    }
    case 'vacancy': {
      ensure(actor.role === 'company', 'Company action only.');
      const raw = text(action.requirements, 500).split(',').map(x => x.trim()).filter(Boolean);
      ensure(raw.length > 0 && raw.length <= 12, 'Add 1–12 required skills.');
      const requirements = raw.map(x => { const parts = x.split(':'); const name = text(parts[0], 60); const level = Number(parts[1] || 1); ensure(parts.length <= 2 && Number.isInteger(level) && level >= 1 && level <= 3, 'Use Skill:1, Skill:2, or Skill:3.'); return { name, level }; });
      ensure(new Set(requirements.map(r => r.name.toLowerCase())).size === requirements.length, 'Remove duplicate skills.');
      next.vacancies.push({ id: id(), companyId: actor.id, title: text(action.title, 100), requirements, shortlisted: [], open: true }); log('Created a vacancy with explicit skill requirements.'); break;
    }
    case 'shortlist': {
      const v = next.vacancies.find(v => v.id === action.vacancyId); const s = student(action.studentId);
      ensure(v && v.companyId === actor.id && actor.role === 'company' && v.open && permitted(s, actor, 'skills') && permitted(s, actor, 'profile'), 'Candidate access is not granted.');
      v.shortlisted = v.shortlisted.includes(s.id) ? v.shortlisted.filter(x => x !== s.id) : [...v.shortlisted, s.id]; log(`Updated shortlist for ${v.title}.`); break;
    }
    case 'issue': {
      const v = next.vacancies.find(v => v.id === action.vacancyId); const s = student(action.studentId);
      ensure(v && v.companyId === actor.id && actor.role === 'company' && v.open && v.shortlisted.includes(s.id) && permitted(s, actor, 'joining') && permitted(s, actor, 'profile') && permitted(s, actor, 'skills'), 'Shortlist the candidate and obtain profile, skill, and joining consent first.');
      ensure(!next.offers.some(o => o.vacancyId === v.id && o.studentId === s.id && o.status !== 'Withdrawn'), 'An offer already exists for this vacancy and student.');
      const joining = date(action.date); ensure(joining >= now.slice(0,10), 'Joining date cannot be in the past.');
      next.offers.push({ id: id(), studentId: s.id, companyId: actor.id, vacancyId: v.id, title: v.title, date: joining, status: 'Issued', response: 'Pending', requests: [], history: [{ at: now, text: `Offer issued by ${actor.name}.` }] }); log(`Issued ${v.title} offer to ${s.name}.`); break;
    }
    case 'date': {
      const o = companyOffer(); ensure(o.status !== 'Joined' && o.status !== 'Withdrawn', 'This offer is closed.'); const d = date(action.date); ensure(d >= now.slice(0,10), 'Joining date cannot be in the past.'); const reason = text(action.reason);
      o.history.push({ at: now, text: `Date changed from ${o.date} to ${d}: ${reason}` }); o.date = d; o.status = 'Deferred'; o.response = 'Pending'; o.requests.forEach(r => r.answered = true); log('Revised joining date; student confirmation is now pending.'); break;
    }
    case 'request': {
      const o = companyOffer(); ensure(o.status !== 'Joined' && o.status !== 'Withdrawn' && o.response !== 'Declined', 'This offer is not awaiting a joining confirmation.');
      ensure(!o.requests.some(r => Date.parse(now) - Date.parse(r.at) < day), 'Wait at least 24 hours between confirmation requests.');
      o.requests.push({ id: id(), at: now, answered: false }); o.history.push({ at: now, text: 'Company requested a joining confirmation in the app.' }); log('Recorded an in-app confirmation request.'); break;
    }
    case 'respond': {
      const o = offer(); ensure(actor.role === 'student' && o.studentId === actor.id && o.status !== 'Joined' && o.status !== 'Withdrawn', 'Student cannot respond to this offer.'); ensure(action.response === 'Accepted' || action.response === 'Declined', 'Choose a response.');
      o.response = action.response; o.requests.forEach(r => r.answered = true); o.history.push({ at: now, text: `Student ${action.response === 'Accepted' ? 'confirmed intention to join' : 'declined the offer'}.` }); log('Updated response to an offer.'); break;
    }
    case 'joined': {
      const o = companyOffer(); ensure(o.response === 'Accepted' && o.status !== 'Joined' && o.status !== 'Withdrawn', 'Student must confirm before joining can be verified.');
      const d = date(action.date); ensure(d <= now.slice(0,10) && d >= o.date, 'Actual joining must be on/after the scheduled date and not in the future.'); const evidence = text(action.reason);
      o.status = 'Joined'; o.joinedAt = d; o.history.push({ at: now, text: `Employer verified joining on ${d}: ${evidence}` }); log('Employer recorded a verified joining.'); break;
    }
    case 'withdraw': {
      const o = companyOffer(); ensure(o.status !== 'Joined' && o.status !== 'Withdrawn', 'This offer is closed.'); o.status = 'Withdrawn'; o.history.push({ at: now, text: `Employer withdrew offer: ${text(action.reason)}` }); log('Employer withdrew an offer with a reason.'); break;
    }
    case 'plan': {
      const o = companyOffer(); ensure(o.status !== 'Withdrawn' && permitted(student(o.studentId), actor, 'learning'), 'Learning access required.'); ensure(!next.tasks.some(t => t.offerId === o.id), 'A learning plan already exists.');
      const v = next.vacancies.find(v => v.id === o.vacancyId); ensure(v, 'Vacancy not found.');
      for (const requirement of v.requirements) next.tasks.push({ id: id(), offerId: o.id, title: `${requirement.name} practical`, skill: requirement.name, criteria: `Demonstrate ${requirement.name} at level ${requirement.level}/3 for ${o.title}. Submit a small example, explain your approach, and document one limitation.`, checked: false, state: 'Not submitted', evidence: '', feedback: '' }); log(`Created a role-based plan from ${v.requirements.length} required skills.`); break;
    }
    case 'task': case 'submit': case 'review': {
      const t = next.tasks.find(t => t.id === action.taskId); ensure(t, 'Task not found.'); const o = next.offers.find(o => o.id === t.offerId)!; const s = student(o.studentId);
      if (action.type === 'review') { ensure(actor.role === 'company' && o.companyId === actor.id && permitted(s, actor, 'learning'), 'Reviewer access required.'); ensure(t.state === 'Submitted', 'Only submitted work can be reviewed.'); ensure(action.result === 'Verified' || action.result === 'Needs revision', 'Choose a review outcome.'); t.state = action.result; t.feedback = text(action.feedback); t.reviewedBy = actor.name; }
      else { ensure(actor.role === 'student' && actor.id === s.id, 'Student action only.'); if (action.type === 'task') { ensure(typeof action.checked === 'boolean', 'Invalid checkbox value.'); t.checked = action.checked; } else { ensure(permitted(s, { id: o.companyId, role: 'company', name: '' }, 'learning'), 'Enable learning sharing with this employer before submitting.'); const evidence = text(action.evidence, 1000); ensure(/^https:\/\//i.test(evidence), 'Provide an HTTPS evidence link.'); try { new URL(evidence); } catch { throw new Error('Provide a valid evidence link.'); } t.evidence = evidence; t.state = 'Submitted'; t.feedback = ''; t.reviewedBy = undefined; t.submittedAt = now; } s.lastActivity = now; }
      log(action.type === 'task' ? 'Updated a personal task checkbox; verification is unchanged.' : action.type === 'submit' ? 'Submitted learning evidence for review.' : `Reviewed work: ${t.state}.`); break;
    }
    case 'case': {
      const o = offer(); const s = student(o.studentId);
      ensure((actor.role === 'college' && s.collegeId === actor.id && permitted(s, actor, 'joining')) || (actor.role === 'student' && actor.id === s.id), 'Student or authorized college access required.');
      next.cases.push({ id: id(), studentId: s.id, offerId: o.id, companyId: o.companyId, collegeId: s.collegeId, subject: text(action.subject, 100), messages: [{ by: actor.name, at: now, text: text(action.message) }], closed: false }); log('Opened a joining clarification case.'); break;
    }
    case 'reply': case 'closeCase': {
      const c = next.cases.find(c => c.id === action.caseId); ensure(c, 'Case not found.'); const s = student(c.studentId);
      ensure(actor.id === c.studentId || ((actor.id === c.companyId || actor.id === c.collegeId) && permitted(s, actor, 'joining')), 'Case access required.');
      ensure(!c.closed, 'Case is already resolved.');
      if (action.type === 'closeCase') { ensure(actor.id === c.studentId || actor.id === c.collegeId, 'Student or college must resolve the case.'); c.closed = true; } else c.messages.push({ by: actor.name, at: now, text: text(action.message) }); log(action.type === 'reply' ? 'Added a clarification reply.' : 'Resolved a clarification case.'); break;
    }
    default: throw new Error('Unknown action.');
  }
  return next;
}
