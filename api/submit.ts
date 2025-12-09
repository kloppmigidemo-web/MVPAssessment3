import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Initialize Supabase with Service Role Key (Secure server-side only)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, result, leadershipScore, teamBuildingScore } = req.body;

  if (!name || !email || !result) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Insert into Supabase
    // Note: User must create table 'assessments'
    const { error: dbError } = await supabase
      .from('assessments')
      .insert([
        {
          name,
          email,
          phone,
          result_type: result,
          leadership_score: leadershipScore,
          team_building_score: teamBuildingScore,
          created_at: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.error('Supabase Error:', dbError);
      throw new Error('Database insertion failed');
    }

    // 2. Send Email via SendGrid
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `You need ${result}`,
      text: `Please contact 755-25-25 for more information.\n\nAssessment Result: ${result}`,
      html: `<p>Please contact <strong>755-25-25</strong> for more information.</p><p><strong>${result}</strong></p>`,
    };

    await sgMail.send(msg);

    return res.status(200).json({ success: true, message: 'Assessment submitted successfully' });
  } catch (error: any) {
    console.error('Server Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}
