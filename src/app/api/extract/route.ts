import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Preparar imagen para Gemini quitando el prefijo de base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    // Default a JPEG si no se especifica, pero trataremos de agarrar el mime correct
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Eres un experto analista de cheques bancarios.
      Analiza la siguiente imagen de un cheque y extrae los datos exactamente como aparecen.
      Responde EXCLUSIVAMENTE con un objeto JSON válido con las siguientes claves (no uses markdown \`\`\`json, solo el JSON puro):
      {
        "fecha": "Extrae la fecha en formato DD/MM/YYYY si la encuentras, de lo contrario un string vacío",
        "monto": "Extrae el monto numérico exacto sin símbolo de dólar ni comas, solo números y punto decimal (ej: 150.00). Si no encuentras, string vacío",
        "montoLetras": "Extrae el monto escrito en palabras completas (ej: Ciento cincuenta dólares). Si no encuentras, string vacío",
        "banco": "Extrae el nombre del banco emisor. Si no encuentras, string vacío",
        "cuenta": "Extrae el número de cuenta bancaria si es visible. Si no encuentras, string vacío",
        "emisor": "Extrae el nombre de quien firma o emite el cheque. Si no encuentras, string vacío",
        "beneficiario": "Extrae el nombre de a favor de quien se emite (paguese a la orden de). Si no encuentras, string vacío",
        "firma": true (booleano, true si detectas cualquier firma manuscrita, false si no)
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Limpiar formatos markdown de la respuesta de la IA
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsedData = JSON.parse(text);

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error('Error processing image with AI:', error);
    return NextResponse.json({ 
      error: 'Failed to process image', 
      details: error.message 
    }, { status: 500 });
  }
}
