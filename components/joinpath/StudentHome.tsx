'use client';

import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Check, MessageCircle, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/joinpath/data';

type Permissions = { profile: boolean; learning: boolean; joining: boolean };
type Props = {
  student?: { jobRole?: string; joiningDate?: string; joiningStatus?: string; dateReason?: string };
  companyName: string;
  choices: { company?: Permissions; college?: Permissions };
  completedCount: number;
  busy: boolean;
  offerOnly: boolean;
  learning: ReactNode;
  onNavigate: (page: string) => void;
  onConfirm: () => void;
  onAsk: () => void;
};

export default function StudentHome({ student, companyName, choices, completedCount, busy, offerOnly, learning, onNavigate, onConfirm, onAsk }: Props) {
  const hasDate = Boolean(student?.joiningDate);
  const confirmed = student?.joiningStatus === 'Confirmed';
  const joined = student?.joiningStatus === 'Joined';
  const sharingCount = Object.values(choices).reduce((total, permissions) => total + Object.values(permissions || {}).filter(Boolean).length, 0);
  const nextPage = hasDate && !confirmed && !joined ? 'Joining timeline' : completedCount < 4 ? 'Learning plan' : 'Privacy & consent';
  const nextTitle = nextPage === 'Joining timeline' ? 'Review your joining update' : nextPage === 'Learning plan' ? 'Continue your learning plan' : 'Review your sharing choices';

  return <div className="space-y-6">
    <section className="border border-[#252623] bg-[#edf3e6] thinshadow grid lg:grid-cols-[1.5fr_1fr]">
      <div className="p-6 lg:p-8">
        <p className="eyebrow">MY NEXT CHAPTER</p>
        <h2 className="text-2xl lg:text-3xl mt-4">{student?.jobRole || 'Your future role'}</h2>
        <p className="text-sm mt-2">{companyName || 'No company connected yet'}</p>
        <p className="text-xs muted mt-5 max-w-xl">Your preparation, your joining updates, your choices. Keep the people supporting you informed on your terms.</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button className="btn primary" onClick={() => onNavigate(nextPage)}>{nextTitle}<ArrowRight size={15}/></button>
          <button className="btn" onClick={onAsk}><MessageCircle size={15}/>Ask my recruiter</button>
        </div>
      </div>
      <div className="border-t lg:border-t-0 lg:border-l border-[#bdcbb2] p-6 lg:p-8 bg-white/50">
        <div className="flex items-center gap-2 text-xs"><CalendarDays size={17}/>LATEST JOINING DATE</div>
        <h3 className="text-2xl mt-4">{formatDate(student?.joiningDate || null)}</h3>
        <p className="text-xs muted mt-3">{student?.dateReason || (hasDate ? 'No additional context provided by your company.' : 'Your company has not provided a joining date yet.')}</p>
        <dl className="border-t border-[#cbd5c2] mt-5 pt-4 text-xs space-y-3">
          <div className="flex justify-between gap-3"><dt>Recorded status</dt><dd className="font-semibold">{student?.joiningStatus || 'No update yet'}</dd></div>
          <div className="flex justify-between gap-3"><dt>Your confirmation</dt><dd className="font-semibold">{joined ? 'Joined' : confirmed ? 'Confirmed' : 'Not confirmed'}</dd></div>
        </dl>
        <p className="text-[11px] muted mt-4">A scheduled date is not proof that an offer is still valid. Ask your recruiter if you need confirmation.</p>
        <button className="btn mt-5 w-full" disabled={busy || !hasDate || confirmed || joined} onClick={onConfirm}>{confirmed || joined ? <Check size={15}/> : <ArrowRight size={15}/>} {joined ? 'Joining recorded' : confirmed ? 'My intention is confirmed' : 'Confirm my intention to join'}</button>
      </div>
    </section>

    {offerOnly ? <section className="panel"><h2 className="text-lg">Keep every change in view.</h2><p className="text-xs muted mt-3">Review the date history and the company’s reason before confirming. This prototype tracks one connected company at a time.</p><div className="flex flex-wrap gap-3 mt-5"><button className="btn" onClick={() => onNavigate('Joining timeline')}>View joining timeline<ArrowRight size={15}/></button><button className="btn" onClick={onAsk}>Draft a clarification request</button></div></section> : <>
      <div className="grid sm:grid-cols-3 gap-4">
        <button className="panel text-left hover:bg-[#f3f5ed]" onClick={() => onNavigate('Learning plan')}><BookOpen size={21}/><h3 className="mt-4 text-lg">{completedCount} of 4 modules complete</h3><p className="text-xs muted mt-2">Small steps, at your pace.</p><progress aria-label="Learning plan completion" max={4} value={completedCount} className="w-full mt-4 accent-[#546d42]"/></button>
        <button className="panel text-left hover:bg-[#f3f5ed]" onClick={() => onNavigate('Joining timeline')}><CalendarDays size={21}/><h3 className="mt-4 text-lg">Your joining journey</h3><p className="text-xs muted mt-2">See date changes and their reasons.</p><span className="text-xs underline block mt-4">Review my timeline →</span></button>
        <button className="panel text-left hover:bg-[#f3f5ed]" onClick={() => onNavigate('Privacy & consent')}><ShieldCheck size={21}/><h3 className="mt-4 text-lg">{sharingCount === 0 ? 'Sharing is off' : `${sharingCount} sharing permissions on`}</h3><p className="text-xs muted mt-2">Choose separately for company and college.</p><span className="text-xs underline block mt-4">Manage my privacy →</span></button>
      </div>
      <div className="grid xl:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {learning}
        <aside className="panel space-y-6">
          <div><p className="eyebrow">YOUR SUPPORT CIRCLE</p><h2 className="text-xl mt-3">You stay in control.</h2><p className="text-xs muted mt-3">Sharing is optional. Checking a task does not grant permission or confirm your joining.</p></div>
          {(['company', 'college'] as const).map(recipient => <div key={recipient} className="border-t border-[#deded7] pt-4"><h3 className="text-sm capitalize">{recipient}</h3><p className="text-xs muted mt-2">{(['profile', 'learning', 'joining'] as const).filter(key => choices[recipient]?.[key]).map(key => ({ profile: 'Profile & contact', learning: 'Learning activity', joining: 'Joining details' })[key]).join(' · ') || 'No information shared'}</p></div>)}
          <button className="btn w-full" onClick={() => onNavigate('Privacy & consent')}>Change sharing choices<ArrowRight size={14}/></button>
          <div className="bg-[#f7f2d9] border border-[#ded6ac] p-4"><h3 className="text-sm">Exams? Plans changed?</h3><p className="text-xs muted mt-2">A quiet week does not define your commitment. You can explain your situation directly to your recruiter.</p><button className="text-xs underline mt-3" onClick={onAsk}>Prepare a message →</button></div>
        </aside>
      </div>
    </>}
  </div>;
}
