// ضعه في: api/greeting.js (مشروع Vercel) وضيف ANTHROPIC_API_KEY في Environment Variables
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name = '', grade = '', score = '', lang = 'ar' } = req.body || {};
  const L = { ar: 'العربية', en: 'English', fr: 'French' }[lang] || 'العربية';
  const prompt = `اكتب عبارة تهنئة قصيرة (سطرين كحد أقصى) لشهادة تقدير للطالب ${String(name).slice(0, 80)}${grade ? ' في ' + String(grade).slice(0, 40) : ''}${score ? ' بدرجة ' + String(score).slice(0, 10) : ''}. اللغة: ${L}. اكتب العبارة فقط من غير مقدمة.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 200, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    res.status(200).json({ message: (d.content?.[0]?.text || '').trim() });
  } catch (e) { res.status(500).json({ message: '' }); }
}
