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
Tu es un assistant commercial expert.
À partir des données JSON suivantes, génère uniquement un bloc de HTML5 structuré, sans CSS ni JavaScript, destiné à un commercial qui découvrira ce lead.

Objectifs du résumé:
- Afficher une fiche d'identité claire (nom, poste, entreprise, localisation).
- Proposer un aperçu de l'activité professionnelle (à partir du “about” et des expériences).
- Dégager une analyse des besoins probables liée au poste et au parcours.
- Utiliser une structure sémantique HTML (<section>, <h2>, <p>, <ul>, <li> ).
- Rester concis, orienté “pitch”, sans jargon technique inutile.

Format de la réponse (exemple de plan):
<section id="identity">
  <h2>John Doe — Étudiant @ EPITECH</h2>
  <p><strong>Localisation:</strong> Lille, Hauts-de-France</p>
  <img src="https://example.com/profile.jpg" alt="John Doe" width="100" height="100" />
</section>
<section id="about">
  <h3>Qui est John ?</h3>
  <p>…</p>
</section>
<section id="experiences">
  <h3>Parcours clé</h3>
  <ul>
    <li><strong>Développeur JS</strong> chez JUWA (févr. 2024-aujourd'hui)</li>
    …
  </ul>
</section>
<section id="needs">
  <h3>Besoins potentiels</h3>
  <p>John est un étudiant en informatique passionné par le développement web et à la recherche d'opportunités pour mettre en pratique ses compétences.</p>
  <p>Il pourrait être intéressé par des stages ou des projets freelance dans le domaine du développement web.</p>
  <p>Il est également ouvert à des opportunités de mentorat ou de collaboration sur des projets open source.</p>
  <p>Enfin, il est curieux d'en apprendre davantage sur les dernières tendances technologiques et de se connecter avec d'autres professionnels du secteur.</p>
</section>

JSON d'entrée (ne pas modifier):
${JSON.stringify(profileData, null, 2)}

Consignes finales:
- Ne renvoie que le HTML (pas de commentaire, pas de balise <html> globale nit de \n inutiles).
- Soigne la hiérarchie sémantique pour faciliter la lecture.
- Mets-toi dans la peau d'un commercial pressé : va à l'essentiel.
- Ne fais pas de copier-coller des données JSON, reformule et synthétise.
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
