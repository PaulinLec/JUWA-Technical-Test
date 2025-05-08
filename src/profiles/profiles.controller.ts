import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of all analyzed profiles',
    type: [ProfileResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @Get()
  async getAll() {
    return this.profilesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: CreateProfileDto,
    description: 'URL of the profile to scrape and analyze',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile scraped, analyzed and stored',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid LinkedIn profile URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'LinkedIn profile not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async scrape(@Body() body: CreateProfileDto) {
    return this.profilesService.processProfile(body.url);
  }
}
