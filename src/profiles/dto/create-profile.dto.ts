import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, Matches } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: 'https://www.linkedin.com/in/john-doe/' })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['https'],
      host_whitelist: ['www.linkedin.com'],
    },
    { message: 'Invalid LinkedIn profile URL' },
  )
  @Matches(/^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/, {
    message: 'Invalid LinkedIn profile URL',
  })
  url: string;
}
