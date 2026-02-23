import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

const getOpenAI = (): OpenAI => {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiInstance;
};

type AISuggestParams = {
  remainingCalories: number;
  remainingProteinG: number;
  remainingCarbsG: number;
  remainingFatG: number;
  goalMode: 'cut' | 'bulk' | 'maintain';
  dietType: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

type AISuggestionItem = {
  name: string;
  description: string;
  estimatedCalories: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
};

function buildPrompt(params: AISuggestParams): string {
  const dietNote = params.dietType !== 'standard'
    ? `The user follows a ${params.dietType} diet — only suggest foods that comply strictly.`
    : '';

  return `
You are a nutrition assistant helping a user reach their daily macro goals.

Goal mode: ${params.goalMode}
Diet: ${params.dietType}
${dietNote}

Remaining macros for today:
- Calories: ${params.remainingCalories} kcal
- Protein: ${params.remainingProteinG}g
- Carbs: ${params.remainingCarbsG}g
- Fat: ${params.remainingFatG}g

Suggest exactly 3 ${params.mealType} options that fit within these remaining macros.
For each suggestion, provide:
- A short meal name
- A 1-2 sentence description
- Estimated macros (calories, protein_g, carbs_g, fat_g)

Respond ONLY with a valid JSON array. No explanation, no markdown.
Format:
[
  {
    "name": "...",
    "description": "...",
    "estimatedCalories": 0,
    "estimatedProteinG": 0,
    "estimatedCarbsG": 0,
    "estimatedFatG": 0
  }
]
  `.trim();
}

export const suggest = async (params: AISuggestParams): Promise<{ suggestions: AISuggestionItem[] }> => {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildPrompt(params) }],
    temperature: 0.7,
    max_tokens: 600,
  });

  const raw = completion.choices[0]?.message.content ?? '[]';

  let suggestions: AISuggestionItem[];
  try {
    suggestions = JSON.parse(raw) as AISuggestionItem[];
  } catch {
    throw Object.assign(new Error('Failed to parse AI response'), { statusCode: 502 });
  }

  return { suggestions };
};
