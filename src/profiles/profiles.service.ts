import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { GptService } from 'src/gpt/gpt.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly gptService: GptService) {}

  async processProfile(url: string) {
    return new Promise((resolve, reject) => {
      // Spawn a new Python process to run the script
      const process = spawn('python', ['scrape_profile.py', '-u', url]);

      let data = '';
      let error = '';

      // Capture standard output and error streams
      process.stdout.on('data', (chunk) => {
        data += chunk;
      });
      process.stderr.on('data', (chunk) => {
        error += chunk;
      });

      // Handle process exit
      process.on('close', async (code) => {
        if (code === 0) {
          try {
            // Attempt to parse the output as JSON
            const parsed = JSON.parse(data);

            // Generate a summary using the GPT service
            await this.gptService.generateSummary(parsed).then((summary) => {
              parsed.summary = summary;
            });

            resolve(parsed);
          } catch (e) {
            reject(`Failed to parse JSON: ${e}`);
          }
        } else {
          reject(`Python script failed: ${error}`);
        }
      });
    });
  }

  async findAll() {
    return [];
  }
}
