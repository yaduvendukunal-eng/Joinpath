'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowRight, Check, Building2, GraduationCap, UserRound, ShieldCheck, ArrowUp, LayoutDashboard, Users, BookOpen, CalendarDays, ChartNoAxesCombined, LogOut, Search, Bell, Plus, Download, Clock, ChevronDown, X, LockKeyhole, Eye, CheckCircle2, Mail, SlidersHorizontal } from 'lucide-react';
import { Badge, Stat } from './common';
import { Role, formatDate, lessons } from '@/lib/joinpath/data';
type Props = {
    role: Role;
    completed: string[];
    setModal: (value: any) => void;
};
export default function LearningPlan({ role, completed, setModal }: Props) {
    return (<section className="panel"><div className="flex items-center justify-between"><div><h2 className="text-xl">Software Engineer</h2><p className="text-xs muted mt-2">Your role-based path to a confident first day.</p></div><Badge>{role === 'student' ? completed.length + ' / 4 completed' : '4 modules'}</Badge></div>{lessons.map(l => <div key={l.id} className="flex items-center gap-4 py-5 border-b last:border-0 border-[#deded7]"><div className="border border-[#a8b49a] bg-[var(--soft)] p-3">{role === 'student' && completed.includes(l.id) ? <Check size={18}/> : <span className="display text-sm">{l.id}</span>}</div><div><h3 className="text-sm">{l.name}</h3><p className="text-[11px] muted mt-2">{completed.includes(l.id) && role === 'student' ? 'Completed' : l.time + ' · Practical exercise'}</p></div><button className="btn ml-auto" onClick={() => setModal({ type: 'lesson', lesson: l })}>{completed.includes(l.id) && role === 'student' ? 'Review' : 'Open'}<ArrowRight size={13}/></button></div>)}</section>);
}
