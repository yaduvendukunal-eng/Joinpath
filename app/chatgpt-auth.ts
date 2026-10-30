// Compatibility names retained so the existing account/workspace APIs use one verified identity source.
// This independent edition authenticates through Supabase only; platform headers are not trusted.
import { redirect } from 'next/navigation';
import { serverAuth } from '@/lib/supabase/server';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{
 const auth=await serverAuth();const {data:{user},error}=await auth.auth.getUser();
 if(error||!user?.email||!user.email_confirmed_at)return null;
 const name=typeof user.user_metadata?.display_name==='string'?user.user_metadata.display_name:null;
 return {userId:user.id,email:user.email,displayName:name||user.email,fullName:name};
}
export async function requireChatGPTUser(_returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(!user)redirect('/login');return user;}
export const chatGPTSignInPath=(_returnTo:string)=>'/login';
export const chatGPTSignOutPath=(_returnTo='/')=>'/auth/signout';
