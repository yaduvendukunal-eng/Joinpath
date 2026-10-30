import { requireChatGPTUser } from '../../chatgpt-auth';
import UpdatePassword from '@/components/joinpath/UpdatePassword';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/auth/update-password');return <UpdatePassword/>;}
