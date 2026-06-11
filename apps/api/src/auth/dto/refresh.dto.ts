import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Previously issued refresh_token' })
  @IsNotEmpty()
  @IsJWT()
  refresh_token: string;
}
