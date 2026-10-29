import React from 'react';
import { ArrowUpRight } from 'lucide-react';
export function Brand() { return <div className="flex items-center gap-2 display text-3xl tracking-tighter"><ArrowUpRight size={34} className="text-[#78916b]" strokeWidth={3}/>joinpath<span className="text-[#a6ad96]">.</span></div>; }
export function Badge({ children }: {
    children: React.ReactNode;
}) { return <span className="badge">{children}</span>; }
export function Stat({ label, value, note, accent = false }: {
    label: string;
    value: any;
    note: string;
    accent?: boolean;
}) { return <div className={`border border-[#252623] p-5 ${accent ? 'bg-[var(--soft)] thinshadow' : 'bg-white'}`}><div className="flex justify-between text-xs">{label}<ArrowUpRight size={14}/></div><div className="display text-4xl my-3">{value}</div><p className="text-[11px] muted">{note}</p></div>; }
