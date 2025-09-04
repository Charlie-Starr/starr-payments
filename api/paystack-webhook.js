import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const coneId = event.data.metadata?.cone_id;
    const days = parseInt(event.data.metadata?.days || "7", 10);

    if (!coneId) {
      return res.status(400).json({ error: 'No cone_id in metadata' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const { error } = await supabase
      .from('cone_subscriptions')
      .upsert({
        cone_id: coneId,
        status: 'active',
        expiry: expiryDate.toISOString()
      });

    if (error) {
      return res.status(500).json({ error: 'Database error', details: error });
    }

    return res.status(200).json({ ok: true, cone_id: coneId, expires: expiryDate });
  }

  return res.status(200).json({ received: true });
}
