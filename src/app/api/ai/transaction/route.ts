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
    let parsed: any[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) throw new Error('Parsed data is not an array');
    } catch (err) {
      console.error('Failed to parse AI response:', content);
      return Response.json({ error: 'AI gagal memahami teks Anda. Pastikan format teks jelas.' }, { status: 400 });
    }

    if (parsed.length === 0) {
      return Response.json({ error: 'Tidak ada transaksi yang terdeteksi.' }, { status: 400 });
    }

    // 4. Validate and build payload
    const insertPayload = [];
    for (const item of parsed) {
      if (!item.amount || !item.type || !item.category_id || !item.description) {
        continue; // Skip invalid items
      }
      
      const amount = Math.abs(Number(item.amount));
      if (isNaN(amount)) continue;

      const transactionDate = item.date && !isNaN(Date.parse(item.date)) ? item.date : today;

      insertPayload.push({
        user_id: user.id,
        category_id: item.category_id,
        amount,
        type: item.type,
        description: item.description,
        transaction_date: transactionDate,
      });
    }

    if (insertPayload.length === 0) {
      return Response.json({ error: 'Semua transaksi yang diekstrak tidak valid.' }, { status: 400 });
    }

    // 5. Bulk Insert into Supabase
    const { data: transactions, error: insertError } = await supabase
      .from('transactions')
      .insert(insertPayload)
      .select('*, category:categories(*)');

    if (insertError) {
      console.error('Insert error:', insertError);
      return Response.json({ error: 'Gagal menyimpan transaksi ke database.' }, { status: 500 });
    }

    return Response.json({ success: true, count: transactions?.length || 0 });

  } catch (error: any) {
    console.error('AI transaction error:', error);
    return Response.json(
      { error: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
