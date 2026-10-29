export async function api(path: string, body?: any) { const r = await fetch('/api/' + path, { credentials: 'same-origin', cache: 'no-store', ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) }); const data: any = await r.json(); if (!r.ok)
    throw new Error(data.error || 'Could not save. Please try again.'); return data; }
