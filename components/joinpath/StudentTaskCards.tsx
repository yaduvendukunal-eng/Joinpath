'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Check, ShieldCheck } from 'lucide-react';
import { lessons } from '@/lib/joinpath/data';

type Props = {
  completed: string[];
  sessionKey: string;
  joiningConfirmed: boolean;
  hasJoiningDate: boolean;
  busy: boolean;
  onComplete: (module: string, checked: boolean) => void;
  onOpen: (lesson: (typeof lessons)[number]) => void;
  onConsent: () => void;
  onConfirm: () => void;
};
export default function StudentTaskCards(props: Props) {
  const { completed, sessionKey, joiningConfirmed, hasJoiningDate, busy } = props;
  const [entrance, setEntrance] = useState(false);
  const [popping, setPopping] = useState<string[]>([]);
  const previous = useRef<Record<string, boolean> | null>(null);
  const tasks = [
    ...lessons.map(lesson => ({ id: lesson.id, title: lesson.name, detail: lesson.time + ' · Practical exercise', done: completed.includes(lesson.id), Icon: BookOpen, action: () => props.onOpen(lesson), actionLabel: 'Open exercise', disabled: false })),
    { id: 'consent', title: 'Review your sharing choices', detail: 'Keep every category off or choose what to share. Both count as a review.', done: completed.includes('consent'), Icon: ShieldCheck, action: props.onConsent, actionLabel: 'Review preferences', disabled: false },
    { id: 'joining', title: 'Confirm your joining date', detail: hasJoiningDate ? 'Confirm the latest date provided by your company.' : 'Waiting for your company to provide a date.', done: completed.includes('joining'), Icon: CalendarDays, action: props.onConfirm, actionLabel: joiningConfirmed ? 'Joining confirmed' : 'Confirm date', disabled: !hasJoiningDate || joiningConfirmed },
  ];
  const signature = tasks.map(t => `${t.id}:${t.done}`).join('|');
  useEffect(() => {
    const key = `joinpath:task-entrance:${sessionKey}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'seen');
        setEntrance(true);
      }
    } catch { setEntrance(true); }
  }, [sessionKey]);
  useEffect(() => {
    const current = Object.fromEntries(tasks.map(t => [t.id, t.done]));
    if (previous.current) {
      const changed = tasks.filter(t => t.done && previous.current![t.id] === false).map(t => t.id);
      if (changed.length) setPopping(ids => [...new Set([...ids, ...changed])]);
    }
    previous.current = current;
  // Compare saved completion state only. Unrelated renders must not replay motion.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  const done = tasks.filter(t => t.done).length;
  return <section className="panel student-tasks" aria-labelledby="student-task-heading">
    <div className="flex flex-wrap justify-between gap-3 items-start mb-5">
      <div><h2 id="student-task-heading" className="text-xl">Your next steps</h2><p className="text-xs muted mt-2">Small steps toward a confident first day.</p></div>
      <span className="text-xs font-semibold" role="status">{done} of 6 tasks complete</span>
    </div>
    <div className="task-overall-track mb-6" role="progressbar" aria-label="Joining preparation" aria-valuemin={0} aria-valuemax={6} aria-valuenow={done}><span style={{ width: `${done / 6 * 100}%` }} /></div>
    <div className="task-grid">{tasks.map((task, index) => <div key={task.id} className={`tile ${entrance ? 'in' : ''}`} style={{ '--i': index } as CSSProperties} onAnimationEnd={e => { if (e.target === e.currentTarget && e.animationName === 'tile-enter' && index === 5) setEntrance(false); }}>
      <article className={`task-card ${task.done ? 'done' : ''} ${popping.includes(task.id) ? 'pop' : ''}`} onAnimationEnd={e => { if (e.target === e.currentTarget && e.animationName === 'pop') setPopping(ids => ids.filter(id => id !== task.id)); }}>
        <div className="flex justify-between gap-3 items-center"><task.Icon size={22} aria-hidden="true" /><label className="task-check-label"><input type="checkbox" checked={task.done} disabled={busy} aria-label={`${task.done ? 'Uncheck' : 'Check'} ${task.title}`} onChange={event => props.onComplete(task.id, event.target.checked)} /><span className="task-check" aria-hidden="true">{task.done && <Check size={15} strokeWidth={3} />}</span></label></div>
        <span className="eyebrow mt-5 block">STEP {String(index + 1).padStart(2, '0')}</span>
        <h3 className="text-base mt-2">{task.title}</h3>
        <p className="text-xs muted mt-3 flex-1">{task.detail}</p>
        <div className="flex justify-between items-center gap-2 mt-5"><span className="task-state">{task.done ? '✓ Complete' : task.disabled ? 'Waiting for date' : 'To do'}</span><button className="task-open" disabled={busy || task.disabled} onClick={task.action}>{task.actionLabel}<ArrowRight size={13} aria-hidden="true" /></button></div>
      </article>
    </div>)}</div>
    <p className="text-[11px] muted mt-5">Tick or untick any card directly. Checklist ticks do not change sharing permissions or your official joining confirmation.</p>
  </section>;
}
