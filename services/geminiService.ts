
import { GoogleGenAI } from "@google/genai";
import * as dataService from "./dataService";

/**
 * SERVICIO DE INTELIGENCIA ARTIFICIAL (GEMINI)
 * -------------------------------------------
 * Analiza las estadísticas de la hospedería para dar recomendaciones.
 */

export const analyzePeriod = async (dataSummary: any): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptTemplate = dataService.getActivePrompt();
    
    // Reemplazar placeholders
    const prompt = promptTemplate
      .replace('{{avgOccupancyCount}}', dataSummary.avgOccupancyCount)
      .replace('{{occupancyPercentage}}', dataSummary.occupancyPercentage)
      .replace('{{newEntries}}', dataSummary.newEntries)
      .replace('{{exits}}', dataSummary.exits)
      .replace('{{totalChildren}}', dataSummary.totalChildren)
      .replace('{{actualPayments}}', dataSummary.actualPayments.toLocaleString('es-CL'))
      .replace('{{pendingDebt}}', dataSummary.pendingDebt.toLocaleString('es-CL'))
      .replace('{{causeData}}', JSON.stringify(dataSummary.causeData))
      .replace('{{countryData}}', JSON.stringify(dataSummary.countryData));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error en Gemini:", error);
    return "Lo sentimos, el servicio de análisis por IA está experimentando una alta demanda. Por favor, intente en unos minutos.";
  }
};
