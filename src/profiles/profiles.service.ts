import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesService {
  async processProfile(url: string) {
    return { message: `Profile processing started for ${url}` };
  }

  async findAll() {
    return [];
  }
}