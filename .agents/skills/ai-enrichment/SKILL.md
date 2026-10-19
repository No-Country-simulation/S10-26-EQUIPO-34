---
name: ai-enrichment
description: >-
  Use this skill when designing prompts, structured LLM outputs, review sentiment/issue categorization, or cold outreach email generation for RepuSense leads using Google Gemini.
---

# AI Enrichment & Cold Outreach Generation Guide (Google Gemini)

This skill governs the LLM prompting, categorization taxonomy, and cold outreach text generation for **RepuSense**, powered by **Google Gemini** (`gemini-2.5-flash` / `gemini-1.5-flash`).

## Objectives

1. **Root-Cause Analysis:** Analyze 3 to 5 real negative customer reviews and identify the recurring business crisis factor.
2. **Personalized Cold Outreach Hook:** Generate an empathetic, non-accusatory, highly targeted email subject and opening paragraph referencing specific real customer grievances, positioning RepuSense as the reputation rescue partner.

## SDK & Provider Setup

- **SDK:** Official `@google/genai` (Google Gen AI SDK) or `@google/generative-ai`.
- **Recommended Model:** `gemini-2.5-flash` (ultra-fast, cost-effective for batch JSON enrichment).
- **Output Mode:** Native `responseMimeType: "application/json"` with `responseSchema` for guaranteed valid JSON without regex parsing.

### Example Gemini Service Implementation

```typescript
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const enrichmentResponseSchema = {
  type: Type.OBJECT,
  properties: {
    primaryIssue: {
      type: Type.STRING,
      description: 'Etiqueta corta del problema principal (ej. Mala atención al cliente)',
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
    },
    summaryReason: {
      type: Type.STRING,
      description: 'Resumen conciso de 1-2 oraciones explicando por qué los clientes están descontentos.',
    },
    severity: {
      type: Type.STRING,
      enum: ['ALTA', 'MEDIA', 'BAJA'],
    },
    emailSubject: {
      type: Type.STRING,
      description: 'Línea de asunto intrigante, corta (< 8 palabras), no spammy',
    },
    emailOpeningHook: {
      type: Type.STRING,
      description: 'Primer párrafo del correo (3-4 oraciones) mencionando una observación genuina y empática.',
    },
  },
  required: ['primaryIssue', 'category', 'summaryReason', 'severity', 'emailSubject', 'emailOpeningHook'],
};

export async function enrichLeadWithGemini(businessName: string, category: string, city: string, reviews: Array<{ rating: number; text: string }>) {
  const prompt = `
Analiza las siguientes reseñas negativas recientes para el negocio "${businessName}" (Rubro: ${category}, Ciudad: ${city}):

RESEÑAS NEGATIVAS:
${reviews.map((r, i) => `${i + 1}. [${r.rating}/5]: "${r.text}"`).join('\n')}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: `Eres un consultor experto en gestión de reputación online y prospección B2B para la agencia RepuSense.
Tu labor es analizar reseñas reales de negocios locales con crisis reputacionales y crear ganchos de prospección comercial en frío altamente efectivos, profesionales y empáticos.
Nunca inventes datos que no estén presentes en las reseñas.
No uses tono acusatorio ni ofensivo; tu enfoque debe ser de aliado estratégico que detecta una oportunidad de rescate de clientes.`,
      responseMimeType: 'application/json',
      responseSchema: enrichmentResponseSchema,
      temperature: 0.2,
    },
  });

  return JSON.parse(response.text.trim());
}
```

## Problem Categorization Taxonomy

Categorize negative feedback into standard business crisis categories:
- `MALA_ATENCION`: Poor customer service, rude staff, lack of empathy.
- `TIEMPOS_ESPERA`: Long wait times, delays, reservation mismatches.
- `HIGIENE_CALIDAD`: Cleanliness issues, food safety, defective physical service.
- `PRECIOS_COBROS`: Overcharging, hidden fees, perceived low value for money.
- `COMUNICACION_SEGUIMIENTO`: No one answers the phone, ghosting complaints, lack of post-service follow-up.
- `OTRO`: Uncategorized or specific edge case.

## Tone & Cold Outreach Principles

1. **The "Soft Call-out":** Don't say *"Tus clientes te odian y tienes 2 estrellas"*. Say *"Notamos que la calidad de su servicio suele ser destacada, pero en el último mes varios clientes han mencionado demoras en la atención en Google..."*.
2. **Relevance over Fluff:** Directly connect the specific problem to lost revenue (e.g., potential customers reading low ratings before booking).
3. **Clear Low-Friction Call-to-Action (CTA):** End with a conversational ask (e.g., *"¿Tendrías 5 minutos esta semana para ver cómo hemos ayudado a otros negocios de [categoría] a neutralizar estas alertas?"*).

## Implementation & Token Optimization
- Clean review text before sending to Gemini (strip emojis overload, truncate individual reviews to max 400 characters).
- Cache enrichment outputs by `leadId` so the same business is never enriched twice unnecessarily.
- Provide a manual "Regenerar" trigger in the dashboard in case the sales rep wants another variation.
