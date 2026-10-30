'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowRight, Check, Building2, GraduationCap, UserRound, ShieldCheck, ArrowUp, LayoutDashboard, Users, BookOpen, CalendarDays, ChartNoAxesCombined, LogOut, Search, Bell, Plus, Download, Clock, ChevronDown, X, LockKeyhole, Eye, CheckCircle2, Mail, SlidersHorizontal } from 'lucide-react';
import { Brand, Badge, Stat } from './common';
import { Role, roles, roleIcons, blankChoices, lessons, sampleCandidates, formatDate } from '@/lib/joinpath/data';
import { api } from '@/lib/joinpath/api';
import LoginScreen from './LoginScreen';
import JoiningOutlook from './JoiningOutlook';
import CandidateTable from './CandidateTable';
import LearningPlan from './LearningPlan';
import StudentTaskCards from './StudentTaskCards';
import StudentHome from './StudentHome';
import JoiningTimeline from './JoiningTimeline';
import ConsentSettings from './ConsentSettings';
export default function Joinpath({ dashboard = false }: {
    dashboard?: boolean;
}) {
    const [user, setUser] = useState<any>(null), [account, setAccount] = useState<any>(null), [workspace, setWorkspace] = useState<any>(null), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [role, setRole] = useState<Role>('student'), [page, setPage] = useState('Overview'), [demo, setDemo] = useState(false), [mode, setMode] = useState<'login' | 'register'>('login'), [toast, setToast] = useState(''), [query, setQuery] = useState(''), [filter, setFilter] = useState('All candidates'), [modal, setModal] = useState<any>(null), [choices, setChoices] = useState<any>(blankChoices), [employer, setEmployer] = useState(''), [college, setCollege] = useState(''), [consentDirty, setConsentDirty] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const notify = (s: string) => { setToast(s); setTimeout(() => setToast(''), 4500); };
    function hydrate(w: any) { setWorkspace(w); setAccount(w.me); setRole(w.me.role); setChoices(JSON.parse(w.me.consent || '{}').company ? JSON.parse(w.me.consent) : blankChoices()); setEmployer(w.me.employerId || ''); setCollege(w.me.collegeId || ''); setConsentDirty(false); }
    useEffect(() => { let active = true; async function load() { try {
        const a = await api('account');
        if (!active)
            return;
        setUser(a.user);
        setAccount(a.account);
        if (a.account) {
            setRole(a.account.role);
            if (!dashboard && new URLSearchParams(location.search).has('setup')) {
                const logged: any = await api('account', {});
                location.replace('/dashboard/' + logged.role);
                return;
            }
        }
        else {
            const selected = new URLSearchParams(location.search).get('role');
            if (roles.includes(selected as Role))
                setRole(selected as Role);
            if (new URLSearchParams(location.search).get('setup'))
                setMode('register');
        }
        if (dashboard) {
            const w = await api('workspace');
            if (active)
                hydrate(w);
        }
    }
    catch (e: any) {
        if (active)
            setError(e.message);
    }
    finally {
        if (active)
            setReady(true);
    } } load(); return () => { active = false; }; }, [dashboard]);
    useEffect(() => { document.documentElement.style.setProperty('--accent', role === 'student' ? '#c9dfb9' : role === 'college' ? '#d7cee9' : '#e9d887'); document.documentElement.style.setProperty('--soft', role === 'student' ? '#edf3e6' : role === 'college' ? '#f0ecf7' : '#f7f2d9'); }, [role]);
    useEffect(() => { if (modal)
        dialog.current?.showModal();
    else
        dialog.current?.close(); }, [modal]);
    function startDemo(r: Role) { setDemo(true); setRole(r); setPage('Overview'); hydrate({ me: { id: 'demo', lastLogin: new Date().toISOString(), name: r === 'student' ? 'Aarav Sharma' : r === 'company' ? 'Priya Menon' : 'Dr. Kavita Rao', email: 'demo@joinpath.example', organization: r === 'company' ? 'Acme Technologies' : r === 'college' ? 'RV College' : 'RV College of Engineering', role: r, consent: JSON.stringify(blankChoices()), completed: '["01","02"]', joiningStatus: 'Awaiting reply', joiningDate: '2026-11-16', dateReason: 'Onboarding batch rescheduled.', jobRole: 'Software Engineer', history: '[]' }, candidates: sampleCandidates, directory: [{ id: 'acme', name: 'Acme Technologies (sample)', role: 'company' }, { id: 'rv', name: 'RV College (sample)', role: 'college' }], audit: [] }); }
    async function mutate(body: any) { setBusy(true); setError(''); try {
        if (demo) {
            const w = structuredClone(workspace);
            if (body.action === 'complete') {
                const current = JSON.parse(w.me.completed);
                w.me.completed = JSON.stringify(body.completed === false ? current.filter((id: string) => id !== body.module) : [...new Set([...current, body.module])]);
            }
            if (body.action === 'confirm')
                w.me.joiningStatus = 'Confirmed';
            if (body.action === 'consent') {
                w.me.consent = JSON.stringify(body.choices);
                w.me.employerId = body.employerId;
                w.me.collegeId = body.collegeId;
                w.audit.unshift({ id: Date.now(), createdAt: new Date().toISOString(), version: '1.0', choices: JSON.stringify(body) });
            }
            if (body.action === 'offer') {
                w.candidates = w.candidates.map((p: any) => p.id === body.studentId ? { ...p, joiningDate: body.date, joiningStatus: 'Deferred', dateReason: body.reason } : p);
            }
            hydrate(w);
            notify('Updated in sample mode. No real account data was changed.');
        }
        else {
            await api('workspace', body);
            hydrate(await api('workspace'));
            notify(body.action === 'consent' ? 'Sharing preferences saved. Your choices now apply.' : 'Saved successfully.');
        }
        setModal(null);
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function submitAccount(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); try {
        const f = new FormData(e.currentTarget);
        const r = await api('account', { role, name: f.get('name'), organization: f.get('organization') || '' });
        location.assign('/dashboard/' + r.role);
    }
    catch (e: any) {
        setError(e.message);
        setBusy(false);
    } }
    const navTo = (p: string) => { if (consentDirty && p !== 'Privacy & consent' && !window.confirm('Leave without saving your sharing changes?'))
        return; setConsentDirty(false); setPage(p); setQuery(''); setFilter('All candidates'); setError(''); };
    const signInHref = '/login';
    if (!dashboard && !demo)
        return <LoginScreen role={role} setRole={setRole} mode={mode} setMode={setMode} account={account} user={user} ready={ready} busy={busy} setBusy={setBusy} error={error} setError={setError} submitAccount={submitAccount} signInHref={signInHref} startDemo={startDemo}/>;
    const me = workspace?.me;
    const checkedTasks: string[] = me ? JSON.parse(me.completed || '[]') : [];
    const completed = checkedTasks.filter(id => ['01', '02', '03', '04'].includes(id));
    const candidates = workspace?.candidates || [];
    const filtered = candidates.filter((p: any) => (filter === 'All candidates' || p.joiningStatus === filter || (filter === 'At risk' && p.signal?.includes('21+'))) && (p.name + ' ' + (p.organization || '') + ' ' + (p.jobRole || '')).toLowerCase().includes(query.toLowerCase()));
    const sharedCount = candidates.length;
    const menus = role === 'student' ? ['Overview', 'My offer', 'Learning plan', 'Joining timeline', 'Privacy & consent'] : role === 'college' ? ['Overview', 'Students', 'Companies', 'Joining calendar', 'Reports'] : ['Overview', 'Candidates', 'Learning plans', 'Joining calendar', 'Reports'];
    const menuIcons = role === 'student' ? [LayoutDashboard, Building2, BookOpen, CalendarDays, ShieldCheck] : [LayoutDashboard, Users, BookOpen, CalendarDays, ChartNoAxesCombined];
    const saveConsent = (withdraw = false) => mutate({ action: 'consent', choices: withdraw ? blankChoices() : choices, employerId: employer || null, collegeId: college || null });
    const exportCSV = () => { const rows = [['Name', 'Organization', 'Role', 'Joining status', 'Learning progress'], ...filtered.map((p: any) => [p.name, p.organization || 'Private', p.jobRole || 'Private', p.joiningStatus || 'Private', p.progress === null ? 'Private' : p.progress + '%'])]; const csv = rows.map(r => r.map((v: any) => '"' + String(v).replace(/^[=+\-@]/, "'$&").replaceAll('"', '""') + '"').join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'joinpath-candidates.csv'; a.click(); URL.revokeObjectURL(a.href); notify('Exported the information currently shared with you.'); };
    const chart = <JoiningOutlook demo={demo} candidates={candidates}/>;
    const table = <CandidateTable role={role} demo={demo} filtered={filtered} filter={filter} setFilter={setFilter} setModal={setModal} query={query} exportCSV={exportCSV}/>;
    const learning = role === 'student' ? <StudentTaskCards completed={checkedTasks} sessionKey={me?.id + ':' + (me?.lastLogin || 'demo-session')} joiningConfirmed={me?.joiningStatus === 'Confirmed'} hasJoiningDate={!!me?.joiningDate} busy={busy} onComplete={(module, checked) => mutate({ action: 'complete', module, completed: checked })} onOpen={lesson => setModal({ type: 'lesson', lesson })} onConsent={() => navTo('Privacy & consent')} onConfirm={() => mutate({ action: 'confirm' })}/> : <LearningPlan role={role} completed={completed} setModal={setModal}/>;
    const timeline = <JoiningTimeline me={me} demo={demo}/>;
    const privacy = <ConsentSettings workspace={workspace} choices={choices} employer={employer} college={college} setEmployer={setEmployer} setCollege={setCollege} setChoices={setChoices} setConsentDirty={setConsentDirty} consentDirty={consentDirty} busy={busy} saveConsent={saveConsent}/>;
    let body: React.ReactNode;
    if (page === 'Privacy & consent')
        body = privacy;
    else if (page === 'Learning plan' || page === 'Learning plans')
        body = <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6">{learning}<section className="panel"><h2 className="text-lg">Learning with a destination.</h2><p className="text-xs muted mt-4">A practical foundation for your first engineering role: collaborate with Git, build an API, and test your work.</p><div className="bg-[var(--soft)] p-5 border border-[#deded7] mt-6"><BookOpen size={24}/><h3 className="mt-4">Small steps count.</h3><p className="text-xs muted mt-3">Learning activity is a check-in signal, not a performance judgment. A quiet week might simply mean exams.</p></div></section></div>;
    else if (page === 'Joining timeline')
        body = timeline;
    else if (page === 'Joining calendar')
        body = <div className="space-y-6">{chart}{table}</div>;
    else if (page === 'Candidates' || page === 'Students')
        body = table;
    else if (page === 'Reports')
        body = <><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"><Stat label="Visible student records" value={demo ? 142 : sharedCount} note="Students who have shared information" accent/><Stat label="Joining confirmed" value={demo ? 86 : candidates.filter((p: any) => p.joiningStatus === 'Confirmed').length} note="Confirmation is an intention to join"/><Stat label="Actually joined" value={demo ? 18 : candidates.filter((p: any) => p.joiningStatus === 'Joined').length} note="Confirmed by the employer"/><Stat label="Records with joining access" value={demo ? 128 : candidates.filter((p: any) => p.joiningStatus !== null).length} note="Respects individual sharing choices"/></div><section className="panel"><h2>Report what actually happened.</h2><p className="text-sm muted mt-4 max-w-3xl">Offers are commitments issued by employers. Confirmations are a student’s current intention. Joinings are recorded only when the employer verifies attendance on day one. Counts here cover only information shared with your workspace.</p><button className="btn primary mt-6" onClick={exportCSV}><Download size={15}/>Export shared candidate data</button></section></>;
    else if (page === 'Companies')
        body = <section className="panel"><h2 className="text-xl">Registered company workspaces</h2><p className="text-xs muted mt-2">Registration is self-reported. It does not grant access to student information.</p>{workspace?.directory.filter((d: any) => d.role === 'company').map((d: any) => <div className="flex gap-4 border-b border-[#deded7] py-6 items-center" key={d.id}><Building2 size={25}/><h3>{d.name}</h3><Badge>Registered workspace</Badge></div>)}{!workspace?.directory.some((d: any) => d.role === 'company') && <p className="py-12 text-sm muted">No company workspaces have registered yet.</p>}</section>;
    else if (role === 'student')
        body = <StudentHome student={me} companyName={employer ? workspace?.directory.find((d: any) => d.id === employer)?.name || 'Your connected company' : demo ? 'Acme Technologies · sample' : ''} choices={choices} completedCount={completed.length} busy={busy} offerOnly={page === 'My offer'} learning={learning} onNavigate={navTo} onConfirm={() => mutate({ action: 'confirm' })} onAsk={() => setModal({ type: 'message' })}/>;
    else
        body = <><div className="bg-[#faf7e9] border border-[#dad2b4] p-4 flex gap-3 items-start mb-6 text-xs"><Clock size={17} className="shrink-0"/><p><b>{demo ? 'November is around the corner.' : 'A clearer picture starts with consent.'}</b> {demo ? '24 candidates are joining in the next 30 days. 8 are yet to confirm.' : 'Student records appear when students select your workspace and allow sharing.'}</p><button className="underline ml-auto whitespace-nowrap" onClick={() => navTo('Joining calendar')}>Review joinings →</button></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7"><Stat label={role === 'college' ? 'Students sharing with you' : 'Connected candidates'} value={demo ? 128 : sharedCount} note={demo ? '16 new offers this month' : 'Students with at least one shared category'} accent/><Stat label="Joining confirmed" value={demo ? 86 : candidates.filter((p: any) => p.joiningStatus === 'Confirmed').length} note="Student-confirmed joining intentions"/><Stat label="Need attention" value={demo ? 12 : candidates.filter((p: any) => p.signal?.includes('21+')).length} note="Based on shared learning activity"/><Stat label={role === 'college' ? 'Actually joined' : 'Learning engagement'} value={role === 'college' ? (demo ? 18 : candidates.filter((p: any) => p.joiningStatus === 'Joined').length) : (demo ? '74%' : candidates.filter((p: any) => p.progress !== null).length ? Math.round(candidates.filter((p: any) => p.progress !== null).reduce((s: number, p: any) => s + p.progress, 0) / candidates.filter((p: any) => p.progress !== null).length) + '%' : '—')} note={role === 'college' ? 'Employer-verified outcomes' : 'Average progress among shared learning records'}/></div><div className="grid xl:grid-cols-[1.6fr_1fr] gap-6 mb-7">{chart}<section className="panel"><h2 className="text-lg">A little attention, a big difference</h2><p className="text-[11px] muted mt-2">Clear signals. Human follow-ups.</p>{[{ icon: Clock, title: 'Learning has gone quiet', text: demo ? '5 candidates inactive for 21+ days' : candidates.filter((p: any) => p.signal?.includes('21+')).length + ' inactivity flags from shared records', target: 'At risk' }, { icon: Mail, title: 'Joining confirmations', text: demo ? '4 candidates missed 2 confirmation requests' : candidates.filter((p: any) => p.joiningStatus === 'Awaiting reply').length + ' candidates awaiting confirmation', target: 'Awaiting reply' }, { icon: CalendarDays, title: 'Plans changed. Keep them updated.', text: demo ? '3 candidates have a deferred joining date' : candidates.filter((p: any) => p.joiningStatus === 'Deferred').length + ' shared dates have been revised', target: 'Deferred' }].map((x, i) => <div className="flex gap-3 py-5 border-b last:border-0 border-[#deded7]" key={i}><span className="p-2 bg-[var(--soft)] h-fit"><x.icon size={17}/></span><div><b className="text-xs">{x.title}</b><p className="text-[11px] muted mt-2">{x.text}</p><button className="text-[11px] underline mt-2" onClick={() => { setPage(role === 'college' ? 'Students' : 'Candidates'); setFilter(x.target); }}>Review candidates →</button></div></div>)}</section></div>{table}</>;
    const title = page === 'Overview' ? (role === 'company' ? 'The path to day one, in view.' : role === 'college' ? 'Every student. A clear next step.' : 'Your journey. Your next step.') : page === 'Privacy & consent' ? 'Your information. Your choice.' : page === 'My offer' ? 'Your offer. Your next step.' : page;
    return <div className="max-w-[1700px] mx-auto min-h-screen bg-[#fcfcf9] md:grid md:grid-cols-[210px_1fr]"><aside className="md:sticky md:top-0 md:h-screen border-r border-[#deded7] bg-[#f7f7f2] p-5 flex flex-col"><Brand /><div className="eyebrow !text-[8px] mt-3 mb-9 hidden md:block">FROM OFFER TO DAY ONE</div><div className="border border-[#deded7] bg-white p-3 mt-5 md:mt-0 flex gap-3 items-center"><div className="p-2 border border-[#252623] bg-[var(--soft)]">{role === 'student' ? <UserRound size={17}/> : role === 'college' ? <GraduationCap size={17}/> : <Building2 size={17}/>}</div><div className="min-w-0"><b className="text-[11px] truncate block">{role === 'student' ? 'My workspace' : me?.organization || 'Your workspace'}</b><p className="text-[10px] muted mt-1 capitalize">{role} account</p></div></div><div className="eyebrow mt-8 mb-3 hidden md:block">WORKSPACE</div><nav className="flex md:flex-col gap-1 overflow-x-auto mt-4 md:mt-0">{menus.map((n, i) => { const Icon = menuIcons[i]; return <button key={n} onClick={() => navTo(n)} className={`flex gap-3 items-center text-left text-xs px-3 py-3.5 whitespace-nowrap ${page === n ? 'border border-[#252623] bg-[var(--accent)] thinshadow font-semibold' : 'border border-transparent'}`}><Icon size={18}/>{role === 'student' && n === 'Overview' ? 'My home' : n}</button>; })}</nav><div className="mt-auto pt-8 hidden md:block"><div className="bg-[#eeeee7] border border-[#deded7] p-4 mb-6"><ShieldCheck size={19}/><h3 className="text-xs mt-3">A better first day starts here.</h3><p className="text-[11px] muted mt-2">Keep every next step connected.</p>{role === 'student' && <button className="text-[11px] underline mt-3" onClick={() => navTo('Privacy & consent')}>Review sharing choices →</button>}</div><div className="text-xs font-semibold truncate">{me?.name}</div><p className="text-[10px] muted mt-2 truncate">{me?.email}</p><button className="flex items-center gap-2 text-[11px] mt-5" onClick={() => { if (demo) {
        location.assign('/login');
    }
    else
        location.assign('/auth/signout'); }}><LogOut size={14}/>{demo ? 'Exit sample mode' : 'Sign out'}</button></div></aside><div className="min-w-0"><header className="min-h-20 bg-white border-b border-[#deded7] px-5 lg:px-9 flex flex-wrap gap-4 justify-between items-center py-4"><div className="flex items-center gap-2"><Search size={18} className="muted"/><input aria-label="Search candidates" value={query} onChange={e => { setQuery(e.target.value); if (role !== 'student')
        setPage(role === 'college' ? 'Students' : 'Candidates'); }} placeholder={role === 'student' ? 'Your connected workspace' : 'Search candidates…'} disabled={role === 'student'} className="!border-0 !p-0 text-xs !bg-transparent max-w-48"/></div><div className="flex items-center gap-5">{demo ? <div className="flex bg-[#f6f6f1] p-1 border border-[#deded7]">{roles.map(r => <button key={r} onClick={() => startDemo(r)} className={`text-[11px] px-3 py-2 capitalize ${role === r ? 'bg-[#252623] text-white' : ''}`}>{r}</button>)}</div> : <Badge><ShieldCheck size={12}/><span className="capitalize">{role} workspace</span></Badge>}<button aria-label="Workspace updates" onClick={() => setModal({ type: 'updates' })}><Bell size={18}/></button><span className="rounded-full border border-[#98a88a] bg-[#e6ebdd] w-8 h-8 flex items-center justify-center text-[10px]">{me?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('') || 'JP'}</span><button className="md:hidden" aria-label="Sign out" onClick={() => location.assign(demo ? '/login' : '/auth/signout')}><LogOut size={17}/></button></div></header><main className="p-5 lg:p-9">{demo && <div className="flex justify-between gap-4 bg-[#f0edf6] border border-[#d7cde8] px-4 py-3 mb-6 text-[11px]"><span>Sample mode · Explore the experience with fictional data.</span><button className="underline shrink-0" onClick={() => location.assign('/login')}>Back to login →</button></div>}<div className="eyebrow mb-3">{role} WORKSPACE / {page}</div><div className="flex justify-between gap-4 items-start mb-7"><div><h1 className="text-2xl lg:text-[30px] leading-tight">{title}</h1><p className="text-xs muted mt-3">{page === 'Privacy & consent' ? 'Clear choices. Specific recipients. No surprises.' : role === 'student' ? `Hey ${me?.name?.split(' ')[0] || 'there'}, here’s what you know, what comes next, and what you control.` : 'A little clarity today. A more confident joining tomorrow.'}</p></div>{role !== 'student' && <button className="btn shrink-0 hidden lg:flex" onClick={exportCSV}><Download size={14}/>Export report</button>}</div>{error && <div role="alert" className="p-4 mb-5 border border-red-200 bg-red-50 text-red-700 text-xs">{error}<button className="underline ml-4" onClick={async () => { try {
        hydrate(await api('workspace'));
        setError('');
    }
    catch (e: any) {
        setError(e.message);
    } }}>Retry</button></div>}{!ready || !workspace ? <div className="panel text-center py-20 muted">{error ? 'We couldn’t load the workspace. Please retry above.' : 'Loading your workspace…'}</div> : body}<footer className="flex flex-wrap gap-3 justify-between text-[10px] muted mt-7"><span>● One shared path. Everyone in the loop.</span><span>{demo ? 'Sample data · Changes last for this preview' : 'Secure account · Sharing controlled by students'}</span></footer></main></div><dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => { if (e.target === dialog.current)
        setModal(null); }}>{modal && <><button className="float-right" aria-label="Close dialog" onClick={() => setModal(null)}><X size={20}/></button>{modal.type === 'lesson' ? <><Badge>Software Engineer · Module {modal.lesson.id}</Badge><h2 className="text-2xl mt-5">{modal.lesson.name}</h2><p className="text-xs muted mt-2">{modal.lesson.time} · Practical exercise</p><h3 className="mt-7">Your practical task</h3><p className="text-sm muted mt-3">{modal.lesson.task}</p><h3 className="mt-6">Before you mark it complete</h3><p className="text-xs muted mt-3">Make sure you can explain your approach and one thing you would improve.</p><div className="flex justify-end gap-3 mt-7"><button className="btn" onClick={() => setModal(null)}>Back to plan</button>{role === 'student' && <button className="btn primary" disabled={busy} onClick={() => mutate({ action: 'complete', module: modal.lesson.id })}>Mark complete<Check size={14}/></button>}</div></> : modal.type === 'candidate' ? <><h2 className="text-xl">{modal.candidate.name}</h2><p className="text-xs muted mt-3">{modal.candidate.organization || 'College not shared'}</p><div className="mt-5"><Badge>{modal.candidate.joiningStatus || 'Joining status private'}</Badge></div><h3 className="mt-6">Latest signal</h3><p className="text-xs muted mt-3">{modal.candidate.signal}. Signals are an invitation to check in, not a prediction that a candidate will not join.</p>{role === 'company' && modal.candidate.canUpdateJoining && <form className="mt-6 border-t border-[#deded7] pt-5" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); mutate({ action: 'offer', studentId: modal.candidate.id, date: f.get('date'), reason: f.get('reason') }); }}><h3 className="mb-4">Provide or update joining date</h3><label htmlFor="date">Joining date</label><input id="date" name="date" type="date" required defaultValue={modal.candidate.joiningDate || ''} className="my-2"/><label htmlFor="reason">Reason / context for the student</label><textarea id="reason" name="reason" required maxLength={500} className="mt-2" rows={3}/><button className="btn primary mt-4" disabled={busy}>Save joining date</button></form>}</> : modal.type === 'message' ? <><h2 className="text-xl">A question for your recruiter</h2><p className="text-xs muted my-4">Copy this into your preferred messaging app.</p><textarea rows={6} defaultValue={`Hi, I’m looking forward to joining the team. Could you confirm my latest joining date and any steps I should complete before day one? Thank you, ${me?.name}.`}/><p className="text-[11px] muted mt-4">This does not send a message.</p></> : <><h2 className="text-xl">Your workspace updates</h2><p className="text-sm muted mt-5">{demo ? 'You’re exploring a sample workspace. Sign in to create your own account and save your progress.' : 'Your account role and records are saved securely. Reload your workspace to retrieve the latest joining updates.'}</p></>}{error && <p role="alert" className="text-xs text-red-700 mt-4">{error}</p>}</>}</dialog>{toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#252623] text-white border border-[#78816b] p-4 text-xs shadow-lg z-50 max-w-[90vw] w-max">{toast}</div>}</div>;
}
