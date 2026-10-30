import { serverAuth } from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url);const code=url.searchParams.get('code');
 if(code){const auth=await serverAuth();const {error}=await auth.auth.exchangeCodeForSession(code);if(!error){const next=url.searchParams.get('next')==='/auth/update-password'?'/auth/update-password':'/login?setup=1';return Response.redirect(new URL(next,url.origin),303);}}
 return Response.redirect(new URL('/login?auth_error=expired',url.origin),303);
}
