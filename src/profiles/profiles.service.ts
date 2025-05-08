import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { GptService } from 'src/gpt/gpt.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly gptService: GptService,
    private readonly prisma: PrismaService,
  ) {}

  async processProfile(url: string) {
    try {
      // Run the Python scraper and get the profile data
      const profileData = await this.runPythonScraper(url);

      // Check if the profile data is empty or not found
      if (
        !profileData.name &&
        !profileData.headline &&
        !profileData.location &&
        !profileData.about &&
        !profileData.profile_picture &&
        (!profileData.experiences || profileData.experiences.length === 0)
      ) {
        throw new NotFoundException('LinkedIn profile not found');
      }

      // Process the profile data with GPT
      const summaryHtml = await this.gptService.generateSummary(profileData);

      // Save the profile data to the database
      const savedProfile = await this.prisma.profile.upsert({
        where: { url },
        update: {
          rawData: profileData,
          summary: summaryHtml,
        },
        create: {
          url,
          rawData: profileData,
          summary: summaryHtml,
        },
      });

      return savedProfile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow the NotFoundException
      }
      console.error('Error processing profile:', error);
      throw new InternalServerErrorException(
        `Failed to process profile: ${error}`,
      );
    }
  }

  async findAll() {
    // Fetch all profiles from the database
    return this.prisma.profile.findMany();
  }

  private async runPythonScraper(url: string): Promise<any> {
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

            resolve(parsed);
          } catch (json_error) {
            reject("Error while scraping the profile (check your LinkedIn URl and credentials)");
          }
        } else {
          reject(error);
        }
      });
    });
  }
}
