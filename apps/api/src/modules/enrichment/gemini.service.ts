import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';
import { CrisisCategory, CrisisSeverity } from '@prisma/client';

export interface GeneratedCrisisEnrichment {
  primaryIssue: string;
  category: CrisisCategory;
  summaryReason: string;
  severity: CrisisSeverity;
  emailSubject: string;
  emailOpeningHook: string;
  emailBodyDraft?: string;
}

const enrichmentResponseSchema = {
  type: Type.OBJECT,
  properties: {
    primaryIssue: {
      type: Type.STRING,
      description: 'Etiqueta corta del problema principal (ej. Mala atención al cliente, Largos tiempos de espera)',
    },
    category: {
      type: Type.STRING,
      enum: [
        'MALA_ATENCION',
        'TIEMPOS_ESPERA',
        'HIGIENE_CALIDAD',
        'PRECIOS_COBROS',
        'COMUNICACION_SEGUIMIENTO',
        'OTRO',
      ],
      description: 'Categoría estandarizada de la crisis',
    },
    summaryReason: {
      type: Type.STRING,
      description: 'Resumen conciso de 1-2 oraciones explicando por qué los clientes están insatisfechos.',
    },
    severity: {
      type: Type.STRING,
      enum: ['ALTA', 'MEDIA', 'BAJA'],
      description: 'Nivel de severidad del impacto en la reputación',
    },
    emailSubject: {
      type: Type.STRING,
      description: 'Asunto intrigante y respetuoso para correo en frío (< 8 palabras, sin parecer spam)',
    },
    emailOpeningHook: {
      type: Type.STRING,
      description: 'Primer párrafo del correo (3-4 oraciones) mencionando una observación constructiva y empática sobre las reseñas.',
    },
  },
  required: [
    'primaryIssue',
    'category',
    'summaryReason',
    'severity',
    'emailSubject',
    'emailOpeningHook',
  ],
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'dummy-key';
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
  }

  async analyzeReviewsAndGeneratePitch(params: {
    businessName: string;
    category: string;
    city: string;
    reviews: Array<{ rating: number; text: string }>;
  }): Promise<GeneratedCrisisEnrichment> {
    const { businessName, category, city, reviews } = params;

    const formattedReviews = reviews
      .slice(0, 5)
      .map((r, i) => `${i + 1}. [Calificación: ${r.rating}/5 estrellas]: "${r.text.slice(0, 400)}"`)
      .join('\n');

    const prompt = `
Analiza las siguientes reseñas negativas recientes para el negocio local "${businessName}" (Rubro: ${category}, Ubicación: ${city}):

RESEÑAS NEGATIVAS DETECTADAS:
${formattedReviews}

Genera el diagnóstico de la crisis y redacta el asunto y el gancho inicial para que un consultor de RepuSense le proponga una solución de mitigación y gestión reputacional.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: `Eres un consultor senior en gestión de reputación online y prospección B2B para la agencia RepuSense.
Tu labor es analizar reseñas reales de negocios locales con bajas calificaciones y crear diagnósticos y ganchos de prospección comercial en frío altamente efectivos, profesionales y empáticos.
Reglas estrictas:
- Nunca inventes datos ni afirmaciones que no se desprendan de las reseñas.
- Nunca uses tono acusatorio, humillante ni agresivo; habla siempre como un socio estratégico que ayuda a evitar pérdidas de clientes.
- Devuelve únicamente el objeto JSON según el esquema indicado.`,
          responseMimeType: 'application/json',
          responseSchema: enrichmentResponseSchema,
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text) as GeneratedCrisisEnrichment;
      return parsed;
    } catch (error) {
      this.logger.error(`Error calling Gemini API for ${businessName}:`, error);
      // Fallback grace si la API key no está activa o falla
      return {
        primaryIssue: 'Oportunidad de mejora en experiencia del cliente',
        category: CrisisCategory.OTRO,
        summaryReason: `Negocio con calificaciones bajas recientes detectadas en ${city}.`,
        severity: CrisisSeverity.MEDIA,
        emailSubject: `Observación sobre las reseñas recientes de ${businessName}`,
        emailOpeningHook: `Hola equipo de ${businessName}, revisando comentarios recientes en internet sobre su servicio en ${city}, notamos una oportunidad puntual para optimizar la percepción de sus clientes y recuperar ventas que podrían estar perdiéndose por bajas valoraciones.`,
      };
    }
  }
}
