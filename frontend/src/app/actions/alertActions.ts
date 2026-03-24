'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface AlertSubscription {
  email: string;
  target_location: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
}

export async function subscribeToAlerts(data: AlertSubscription): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('telemetry_alerts')
      .insert([
        {
          email: data.email,
          target_location: data.target_location,
          latitude: data.latitude,
          longitude: data.longitude,
          start_date: data.start_date,
          end_date: data.end_date,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('[Supabase Insert Error]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Server Action Error]', err);
    return { success: false, error: err.message ?? 'Unknown server error' };
  }
}
