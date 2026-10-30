import { ArrowUpRight, Building2, GraduationCap, UserRound } from 'lucide-react';
const previews = [
  { role: 'student', label: 'Student', Icon: UserRound, color: '#edf3e6' },
  { role: 'college', label: 'College', Icon: GraduationCap, color: '#f0ecf7' },
  { role: 'company', label: 'Company', Icon: Building2, color: '#f7f2d9' },
];
export default function JudgePreview() {
  return <section aria-labelledby="judge-preview-title" className="border border-[#252623] p-5 mb-8 bg-[#fafaf5] thinshadow">
    <p className="eyebrow">FOR JUDGES & REVIEWERS</p>
    <h2 id="judge-preview-title" className="text-xl mt-3">Explore every dashboard</h2>
    <p className="text-xs muted mt-3">Open any demo dashboard and switch roles freely. No Joinpath account is needed for the sample workspace.</p>
    <div className="grid grid-cols-3 gap-2 mt-5">{previews.map(({ role, label, Icon, color }) => <a key={role} href={'/prototype?role=' + role} aria-label={'Preview ' + label.toLowerCase() + ' dashboard'} className="border border-[#252623] p-3 text-xs flex flex-col items-center gap-3 text-center hover:shadow-md focus-visible:outline-2" style={{ background: color }}><Icon size={22} aria-hidden="true"/><span>{label}</span><ArrowUpRight size={15} aria-hidden="true"/></a>)}</div>
    <p className="text-[10px] muted mt-4">Fictional data, saved only in this browser. Judge preview does not change your real account or role.</p>
  </section>;
}
