import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cone_id } = req.query;
  if (!cone_id) {
    return res.status(400).json({ error: 'cone_id is required' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from('cone_subscriptions')
    .select('status, expiry')
    .eq('cone_id', cone_id)
    .single();

  if (error || !data) {
    return res.status(200).json({ active: false });
  }

  const now = new Date();
  const expiryDate = new Date(data.expiry);

  const active = data.status === 'active' && expiryDate > now;

  return res.status(200).json({
    active,
    expiry: expiryDate.toISOString()
  });
}
