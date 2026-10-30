import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Joinpath — From offer to day one', description: 'A student-first space for joining updates, role-based preparation, and control over information sharing.' };
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
