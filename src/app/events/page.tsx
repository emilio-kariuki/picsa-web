import { cookies } from 'next/headers';
import { supabase } from '../supabase';

export default async function Notes() {
  const { data: notes } = await supabase.from("Events").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}