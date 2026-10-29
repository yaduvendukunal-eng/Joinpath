'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowRight, Check, Building2, GraduationCap, UserRound, ShieldCheck, ArrowUp, LayoutDashboard, Users, BookOpen, CalendarDays, ChartNoAxesCombined, LogOut, Search, Bell, Plus, Download, Clock, ChevronDown, X, LockKeyhole, Eye, CheckCircle2, Mail, SlidersHorizontal } from 'lucide-react';
import { Badge, Stat } from './common';
import { Role, formatDate, lessons } from '@/lib/joinpath/data';
type Props = {
    me: any;
    demo: boolean;
};
export default function JoiningTimeline({ me, demo }: Props) {
    return (<section className="panel"><h2 className="text-xl">Your joining timeline</h2><p className="text-xs muted mt-2">A date change should never be a guessing game.</p>{JSON.parse(me?.history || '[]').length ? JSON.parse(me.history).map((h: any, i: number) => <div key={i} className="border-l-2 border-[#c9d7bb] pl-5 py-5"><div className="eyebrow">{new Date(h.at).toLocaleDateString()}</div><h3 className="my-2">{h.title}</h3><p className="text-xs muted">{h.detail}</p></div>) : <div className="py-10 text-sm muted">{demo ? '20 Oct · Joining date moved from 2 Nov to 16 Nov. Reason: onboarding batch rescheduled.' : 'No joining updates yet. Share your joining information with your company so they can provide a date.'}</div>}<div className="bg-[var(--soft)] border border-[#d6ddce] p-5 mt-4 flex justify-between items-center"><div><div className="eyebrow">CURRENT JOINING DATE</div><h3 className="text-lg mt-3">{formatDate(me?.joiningDate)}</h3></div><Badge>{me?.joiningStatus}</Badge></div></section>);
}
