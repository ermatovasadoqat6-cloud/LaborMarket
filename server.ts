import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// AI Chat endpoint for LaborMarket Assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, role, currentJob, userProfile } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // If Gemini API Key is available, use real gemini-3.8-flash
    if (ai) {
      const systemInstruction = `Siz "LaborMarket" portalining professional virtual kiber-maslahatchisisiz (AI Assistant).
Siz o'zbek tilida (va agar foydalanuvchi rus/ingliz tilida yozsa o'sha tilda) juda xushmuomala, aniq va amaliy yordam berasiz.
Foydalanuvchi roli: ${role === 'employer' ? "Ish beruvchi (Employer) - xodim qidirmoqda va vakansiya joylashtiradi" : "Ish izlovchi (Job Seeker) - ish qidirmoqda, rezyume tuzadi va arizalar topshiradi"}.

Vazifalaringiz:
1. Ish izlovchilarga:
   - Rezyume (CV) tuzish, kuchaytirish va xatolarni tuzatish
   - Vakansiyalarga mos motivatsion xat (Cover Letter) yozish
   - Suhbat (Interview) savollariga tayyorgarlik va simulyatsiya
   - Bozor talablari, sohalardagi maoshlar va o'rganish kerak bo'lgan texnologiyalar
2. Ish beruvchilarga:
   - Jozibador, aniq va professional vakansiya tavsifi (Job Description) yozish
   - Nomzodlar uchun talablar va suhbat savollari ro'yxatini shakllantirish
   - Kadrlarni saralash strategiyalari
3. Platforma bo'yicha yo'naltirish (qanday e'lon berish, ariza yuborish, kabinetdan foydalanish).

Javoblarni chiroyli formatda (markdown, qisqa bandlar, bold matnlar) taqdim eting. Har doim do'stona va ilhomlantiruvchi bo'ling!`;

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text });
    }

    // High quality offline fallback if no API key is provided
    let fallbackReply = '';
    const lower = lastMessage.toLowerCase();

    if (role === 'employer') {
      if (lower.includes('vakansiya') || lower.includes('e\'lon') || lower.includes('elon')) {
        fallbackReply = `💼 **Vakansiya e'loni yaratish bo'yicha maslahatlar:**\n\n1. **Aniq lavozim:** Masalan, "Senior React Developer" yoki "Bosh hisobchi".\n2. **Kompaniya haqida:** Faoliyatingiz va jamoaviy madaniyatingizni qisqa bayon eting.\n3. **Asosiy vazifalar:** 4-6 ta aniq mas'uliyatni belgilang.\n4. **Talablar:** Shartli va xohishiy talablarni ajrating.\n5. **Taklif:** Raqobatbardosh maosh, bonuslar, shinam ofis yoki masofaviy ishlash imkoniyatini ko'rsating.`;
      } else if (lower.includes('suhbat') || lower.includes('savol')) {
        fallbackReply = `🎯 **Nomzodlar bilan suhbat uchun tavsiya etiladigan savollar:**\n\n1. *"Eng qiyin yechgan muammoingiz va unda qanday yondashganingiz haqida gapirib bering?"*\n2. *"Jamoada kelishmovchilik bo'lganda qanday murosaga kelasiz?"*\n3. *"Kompaniyamizning qaysi loyihasi sizni ko'proq qiziqtirdi?"*`;
      } else {
        fallbackReply = `Salom hurmatli ish beruvchi! LaborMarket AI sizga yangi vakansiya tuzish, nomzodlar rezyumelarini saralash va suhbat savollarini tuzishda ko'maklashadi. Menga qanday xodim kerakligini ayting!`;
      }
    } else {
      if (lower.includes('rezyume') || lower.includes('cv')) {
        fallbackReply = `📄 **Mukammal Rezyume (CV) tuzish sirlari:**\n\n1. **Qisqalik va aniqlik:** 1-2 sahifadan oshmasin.\n2. **Natijalar tili:** Masalan, *"Sayt yuklanish tezligini 40% ga oshirdim"* kabi faktlar keltiring.\n3. **Kalit so'zlar:** Vakansiyada so'ralgan texnologiya va ko'nikmalarni yozing.\n4. **Bog'lanish:** Telegram, LinkedIn, GitHub va telefoningizni to'g'ri ko'rsating.`;
      } else if (lower.includes('suhbat') || lower.includes('interview')) {
        fallbackReply = `🤝 **Suhbatga muvaffaqiyatli tayyorgarlik:**\n\n- Kompaniya mahsulotlarini o'rganib chiqing.\n- O'zingiz haqingizda 2 daqiqalik lo'nda taqdimot tayyorlang.\n- Savollarga STAR metodikasi (Vaziyat, Topshiriq, Harakat, Natija) bo'yicha javob bering.\n- Suhbat yakunida ish beruvchiga savol berishdan tortinmang!`;
      } else if (lower.includes('salom') || lower.includes('assalomu')) {
        fallbackReply = `Assalomu alaykum! LaborMarket AI maslahatchisiman. Sizga orzuingizdagi ishni topish, kuchli rezyume tuzish yoki motivatsion xat yozishda yordam berishim mumkin. Qaysi sohada ish qidiryapsiz?`;
      } else {
        fallbackReply = `Ajoyib savol! LaborMarket AI sizga martaba o'sishi, rezyume tahlili va intervyu ko'nikmalarida amaliy yordam berishga tayyor. Savolingizni aniqroq bering va biz birgalikda eng yaxshi natijaga erishamiz!`;
      }
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return res.status(500).json({
      error: 'AI xizmati vaqtincha band',
      details: error.message,
    });
  }
});

// AI Quick Generator for Job Description or Cover Letter
app.post('/api/gemini/quick-generate', async (req, res) => {
  try {
    const { type, prompt } = req.body;
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `Siz professional HR va karyera bo'yicha tahrirchisisiz. Talab qilingan matnni to'g'ridan-to'g'ri, juda chiroyli va o'zbek tilida yozib bering.`,
        },
      });
      return res.json({ text: response.text });
    }

    return res.json({
      text: type === 'job_desc'
        ? `Talablar:\n- Kamida 2 yil tegishli sohada amaliy tajriba;\n- Zamonaviy metodologiyalar va vositalarni yaxshi bilish;\n- Jamoada ishlash va mas'uliyatlilik.\n\nTaklif etamiz:\n- Raqobatbardosh oylik maosh;\n- Zamonaviy va shinam ofis;\n- Kasbiy rivojlanish va kurslar to'lovi;\n- Do'stona va ilg'or jamoa.`
        : `Hurmatli tanlov komissiyasi,\n\nMen sizning kompaniyangizdagi ushbu bo'sh ish o'rniga katta qiziqish bilan ariza topshirmoqdaman. Mening to'plagan amaliy tajribam, muammolarni hal qilish ko'nikmalarim va o'rganishga bo'lgan ishtiyoqim sizning maqsadlaringizga hissa qo'shishiga ishonaman. Suhbatda batafsil ko'rishishga umid qilaman.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev / Static for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LaborMarket server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
