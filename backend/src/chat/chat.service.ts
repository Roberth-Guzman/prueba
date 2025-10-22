import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

@Injectable()
export class ChatService {
  async procesarConsulta(mensaje: string): Promise<string> {
    // 1️⃣ Buscar medicamentos que coincidan con el mensaje
    const meds = await prisma.medicamento.findMany({
      include: { inventarios: { include: { Sede: true } } },

    });

    const coincidencias = meds.filter((m) =>
      mensaje.toLowerCase().includes(m.nombre.toLowerCase())
    );

    // 2️⃣ Preparar datos para el LLM
    const data = coincidencias.length > 0 ? coincidencias : meds.slice(0, 5); // muestra algo

    // 3️⃣ Crear prompt
    const prompt = `
Usuario pregunta: "${mensaje}"
Base de datos: ${JSON.stringify(data, null, 2)}

Indica si el medicamento está disponible, en qué sede, y en caso contrario explica la causa y sugiere alternativas.
Responde en español claro, breve y respetuoso.
`;

    // 4️⃣ Llamar al modelo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente farmacéutico." },
        { role: "user", content: prompt },
      ],
    });

    return completion.choices[0].message.content || "No se pudo generar una respuesta.";
  }
}
