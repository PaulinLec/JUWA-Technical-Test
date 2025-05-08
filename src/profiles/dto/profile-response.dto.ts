import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExperienceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  duration: string;

  @ApiProperty({ required: false })
  @IsString()
  location?: string;
}

export class RawDataDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  headline: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  about: string;

  @ApiProperty()
  @IsString()
  profile_picture: string;

  @ApiProperty({ type: [ExperienceDto] })
  experiences: ExperienceDto[];
}

export class ProfileResponseDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ type: RawDataDto })
  rawData: RawDataDto;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty()
  @IsString()
  createdAt: string;
}
