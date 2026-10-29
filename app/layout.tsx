import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Joinpath — From offer to day one', description: 'One shared path for students, companies, and colleges.' };
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
