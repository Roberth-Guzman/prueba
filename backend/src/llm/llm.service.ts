import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async classifyIntentAndExtractMedication(
    message: string,
  ): Promise<{
    intent: 'SPECIFIC_QUERY' | 'GENERAL_QUERY' | 'GREETING';
    medication?: string;
  }> {
    const prompt = `
Analiza el siguiente mensaje de un usuario a un asistente de farmacia virtual.
Clasifica la intención del usuario en una de las siguientes categorías:
- 'GREETING': Si el usuario solo está saludando (ej: "hola", "buenos días").
- 'GENERAL_QUERY': Si el usuario hace una pregunta general sobre qué hay disponible, qué puedes hacer, o no menciona un medicamento (ej: "¿qué tienes?", "¿me puedes ayudar?").
- 'SPECIFIC_QUERY': Si el usuario pregunta por la disponibilidad de uno o más medicamentos específicos (ej: "¿tienes paracetamol?", "busco ibuprofeno").

Si la intención es 'SPECIFIC_QUERY', extrae el nombre del medicamento. Normaliza el nombre, quita palabras innecesarias y devuélvelo en el campo 'medication'.

Responde únicamente con un objeto JSON con la forma: { "intent": "...", "medication": "..." }

Mensaje del usuario: "${message}"
`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en clasificar la intención de usuarios y extraer entidades. Responde únicamente con el objeto JSON solicitado.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    try {
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      if (['SPECIFIC_QUERY', 'GENERAL_QUERY', 'GREETING'].includes(result.intent)) {
        return result;
      }
    } catch (e) {
      console.error('Failed to parse LLM intent classification response:', e);
    }

    // Fallback por si la clasificación falla
    return { intent: 'SPECIFIC_QUERY', medication: message };
  }

  async generateFoundResponse(
    originalMessage: string,
    medicamentos: any[],
  ): Promise<string> {
    const lista = medicamentos
      .map(
        (m) =>
          `- ${m.nombre} (${m.presentacion}), ${m.cantidad} unidades disponibles en ${
            m.sucursal ?? 'sucursal principal'
          }.`,
      )
      .join('\n');

    const prompt = `
Un cliente pregunta: "${originalMessage}"
Estos son los medicamentos encontrados en la base de datos:
${lista}

Basado en esta información, redacta una respuesta amable, empática y clara para el cliente, indicando la disponibilidad de los medicamentos.`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de farmacia virtual llamado Sally. Eres amable y servicial.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return (
      completion.choices[0].message.content ||
      `Sí, tenemos disponibles los medicamentos que buscas.`
    );
  }

  async generateNotFoundResponse(originalMessage: string): Promise<string> {
    const prompt = `
El usuario preguntó: "${originalMessage}".
No se encontraron coincidencias para esa búsqueda en la base de datos de la farmacia.
Responde amablemente, informa que no se encontró el producto y sugiere que verifique si el nombre está bien escrito o que consulte directamente a un farmacéutico en el local para que le puedan ayudar a encontrar una alternativa.`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de farmacia virtual llamado Sally. Eres amable y servicial.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return (
      completion.choices[0].message.content ||
      'No encontré ese medicamento, pero puedo ayudarte a buscar otro.'
    );
  }
}