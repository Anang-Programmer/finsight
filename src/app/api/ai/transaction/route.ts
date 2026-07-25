import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/ai/groq';
import { AI_MAGIC_SYSTEM_PROMPT, buildAiMagicPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text) {
      return Response.json({ error: 'Teks tidak boleh kosong.' }, { status: 400 });
    }

    // 1. Fetch user categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, type')
      .or(`user_id.eq.${user.id},is_default.eq.true`);

    if (!categories || categories.length === 0) {
      return Response.json({ error: 'Gagal memuat kategori.' }, { status: 500 });
    }

    // 2. Call AI
    const today = new Date().toISOString().split('T')[0];
    const response = await chatCompletion([
      { role: 'system', content: AI_MAGIC_SYSTEM_PROMPT },
      { role: 'user', content: buildAiMagicPrompt(text, categories, today) },
    ], { temperature: 0.1 });

    const content = response.choices?.[0]?.message?.content || '';

    // 3. Parse JSON from AI
    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Failed to parse AI response:', content);
      return Response.json({ error: 'AI gagal memahami teks Anda. Silakan coba deskripsi yang lebih jelas.' }, { status: 400 });
    }

    // 4. Validate parsed data
    if (!parsed.amount || !parsed.type || !parsed.category_id || !parsed.description) {
      return Response.json({ error: 'Informasi dari AI tidak lengkap.' }, { status: 400 });
    }

    // Ensure amount is positive
    const amount = Math.abs(Number(parsed.amount));
    if (isNaN(amount)) {
      return Response.json({ error: 'Nominal tidak valid.' }, { status: 400 });
    }

    // Ensure valid date
    const transactionDate = parsed.date && !isNaN(Date.parse(parsed.date)) ? parsed.date : today;

    // 5. Insert into Supabase
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        category_id: parsed.category_id,
        amount,
        type: parsed.type,
        description: parsed.description,
        transaction_date: transactionDate,
      })
      .select('*, category:categories(*)')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return Response.json({ error: 'Gagal menyimpan transaksi ke database.' }, { status: 500 });
    }

    return Response.json({ success: true, transaction });

  } catch (error: any) {
    console.error('AI transaction error:', error);
    return Response.json(
      { error: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
