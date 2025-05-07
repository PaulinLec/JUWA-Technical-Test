import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor() {
    const config = { apiKey: process.env.OPENAI_API_KEY };
    this.openai = new OpenAI(config);
  }

  async generateSummary(profileData: any): Promise<string> {
    // Construct the prompt for the OpenAI API
    const prompt = `
Tu es un assistant commercial.
À partir des informations ci-dessous, rédige un résumé HTML clair et structuré destiné à un commercial.

Inclure :
- Identité de la personne : nom, poste, entreprise actuelle
- Résumé de son activité pro
- Analyse des besoins probables selon son rôle
- Aucun jargon, seulement des infos utiles pour pitcher

Informations :
${JSON.stringify(profileData, null, 2)}
`;

    // Call the OpenAI API to generate the summary
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    // Check if the response contains a message and return its content
    const result = response.choices[0].message?.content;
    return result ?? '';
  }
}
