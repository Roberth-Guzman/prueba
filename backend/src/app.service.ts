import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { LlmService } from './llm/llm.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async chat(message: string): Promise<string> {
    if (!message || message.trim() === '') {
      return 'Por favor escribe o di el nombre de un medicamento.';
    }

    // 🔹 1. Clasificar la intención del usuario y extraer el medicamento
    const { intent, medication } =
      await this.llm.classifyIntentAndExtractMedication(message);

    // 🔹 2. Actuar según la intención
    switch (intent) {
      case 'SPECIFIC_QUERY':
        // Si la IA no pudo extraer un medicamento, pedimos al usuario que sea más específico.
        if (!medication) {
          return 'No entendí qué medicamento buscas. Por favor, intenta de nuevo con el nombre del producto.';
        }

        // Buscar el medicamento en la base de datos
        const medicamentos = await this.prisma.medicamento.findMany({
          where: {
            nombre: { contains: medication },
          },
        });

        // Usar el LlmService para generar la respuesta de encontrado o no encontrado
        if (medicamentos.length > 0) {
          return this.llm.generateFoundResponse(message, medicamentos);
        } else {
          return this.llm.generateNotFoundResponse(medication); // Pasamos el medicamento extraído
        }

      case 'OTHER':
        // Para cualquier otra intención, dejamos que la IA genere una respuesta conversacional
        return this.llm.generateGeneralResponse(message);

      default:
        // Fallback por si la IA devuelve una intención no esperada
        return this.llm.generateGeneralResponse(message);
    }
  }
}