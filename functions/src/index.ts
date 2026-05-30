import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/generative-ai';

admin.initializeApp();

// Initialize the Google Generative AI client with backend config keys
const getGenerativeAI = () => {
  // Use Firebase secret or standard environment variable
  const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The Gemini API Key is not configured on the server environment variables.'
    );
  }
  const ai = new GoogleGenAI({ apiKey });
  return ai;
};

/**
 * secure endpoint: askCoach
 * Receives: { contextText: string, queryText: string }
 */
export const askCoach = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated Atom FinAI users can consult the AI coach.'
    );
  }

  const { contextText, queryText } = data;
  if (!contextText || !queryText) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required context or query fields.'
    );
  }

  try {
    const ai = getGenerativeAI();
    const model = ai.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: `You are Atom FinAI's Financial Coach. You are an expert financial consultant, encouraging, strategic, and highly professional.
Rules:
1. Use only the provided financial data. Do not invent income, expenses, debts, investments, goals, or savings.
2. Provide highly practical, actionable, personalized suggestions.
3. Focus heavily on: savings improvement, budget discipline, goal achievement, and building healthy spending habits.
4. Keep answers relatively concise and highly structured (use bullet points and clear call-outs).`
    });

    const prompt = `
=== USER PROFILE & FINANCIAL STATS ===
${contextText}

=== USER'S CURRENT QUESTIONS OR INQUIRY ===
"${queryText}"

Provide your personalized coaching response now. Use professional rich formatting.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return { success: true, response: responseText };
  } catch (error: any) {
    console.error("AI Coach backend error:", error);
    throw new functions.https.HttpsError('internal', error.message || 'Error executing AI generation.');
  }
});

/**
 * secure endpoint: analyzeReceipt
 * Receives: { imageBase64: string }
 */
export const analyzeReceipt = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User authentication required.');
  }

  const { imageBase64 } = data;
  if (!imageBase64) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing receipt image content.');
  }

  try {
    const ai = getGenerativeAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format the image for Gemini multimodal call
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `
Analyze this receipt image. Extract these fields and format them strictly as a valid JSON object.
Do not wrap in any markdown formatting (\`\`\`json or similar). Simply return the raw JSON object string.
Required JSON Fields:
- merchantName: string (Name of the store, restaurant, or business. If hard to read, make an educated guess.)
- amount: number (Total amount spent. Clean float value without currency symbols.)
- date: string (Purchase date in YYYY-MM-DD format. If date is missing, return today's date format.)
- category: string (Must map to one of: "Food & Dining", "Shopping", "Transport", "Bills & Utilities", "Entertainment", "Groceries", "Health & Wellness", "Others".)
- confidenceScore: number (Your estimation of parsing accuracy from 0 to 100.)

Output Format Example:
{
  "merchantName": "Starbucks",
  "amount": 250.50,
  "date": "2026-05-30",
  "category": "Food & Dining",
  "confidenceScore": 95
}
`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    // Parse safety check
    let parsedData;
    try {
      // Clean string in case it wrapped it in markdown code blocks regardless of instructions
      let cleanText = responseText;
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }
      parsedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.warn("Gemini didn't return perfect JSON, raw text was:", responseText);
      // Fallback extraction regex helper
      parsedData = {
        merchantName: "Scanned Merchant",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: "Others",
        confidenceScore: 30,
        rawText: responseText
      };
    }

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error("Receipt Scanner backend error:", error);
    throw new functions.https.HttpsError('internal', error.message || 'Error processing receipt OCR.');
  }
});
