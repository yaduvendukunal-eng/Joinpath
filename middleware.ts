import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authConfig } from './lib/supabase/config';
import { apiFailure } from './lib/joinpath/api-failure';
export async function middleware(request:NextRequest){
 try {
 let response=NextResponse.next({request});const {url,key}=authConfig();
 const auth=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){for(const {name,value}of values)request.cookies.set(name,value);response=NextResponse.next({request});for(const {name,value,options}of values)response.cookies.set(name,value,{...options,sameSite:'lax',secure:request.nextUrl.protocol==='https:'});}}});
 // Validate the identity with Supabase and refresh expired sessions on the response.
 await auth.auth.getUser();
 response.headers.set('Cache-Control','private, no-store');
 return response;
 } catch (error) {
   if(request.nextUrl.pathname.startsWith('/api/')) return apiFailure(error);
   return NextResponse.next({request});
 }
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|prototype).*)']};
