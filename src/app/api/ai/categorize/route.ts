import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/ai/groq';
import { CATEGORIZE_SYSTEM_PROMPT, buildCategorizePrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    // Get user's categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name, type')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .eq('type', 'expense');

    const categoryNames = categories?.map((c) => c.name) || [];

    const response = await chatCompletion([
      { role: 'system', content: CATEGORIZE_SYSTEM_PROMPT },
      { role: 'user', content: buildCategorizePrompt(description, categoryNames) },
    ], { temperature: 0.3, maxTokens: 256 });

    const content = response.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Response.json(parsed);
      }
    } catch {
      // If JSON parsing fails, return raw
    }

    return Response.json({
      category_name: 'Lainnya',
      confidence: 'low',
    });
  } catch (error) {
    console.error('AI categorize error:', error);
    return Response.json(
      { error: 'Gagal memproses kategori. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
