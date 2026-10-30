export async function api(path: string, body?: unknown) {
  const endpoint = '/api/' + path;
  let response: Response;
  try {
    response = await fetch(endpoint, { credentials: 'same-origin', cache: 'no-store', ...(body !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  } catch {
    throw new Error(`Could not reach ${endpoint}. Check that pnpm dev is still running.`);
  }
  const raw = await response.text();
  const context = `${endpoint} (HTTP ${response.status})`;
  if (!raw.trim()) throw new Error(`${context} returned an empty response. Check the pnpm dev terminal for the server error.`);
  let data: any;
  try { data = JSON.parse(raw); }
  catch { throw new Error(`${context} did not return JSON. Check the pnpm dev terminal for a server or routing error.`); }
  if (!data || typeof data !== 'object') throw new Error(`${context} returned an invalid response.`);
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : `${context} failed. Please retry.`);
  return data;
}
