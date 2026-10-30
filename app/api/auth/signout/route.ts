import { serverAuth } from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const auth=await serverAuth();const {error}=await auth.auth.signOut({scope:'local'});
 if(error)return Response.json({error:'Unable to sign out. Please retry.'},{status:503});
 return Response.redirect(new URL('/login',request.url),303);
}
