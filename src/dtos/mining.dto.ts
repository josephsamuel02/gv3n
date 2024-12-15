import { IsString, IsNotEmpty, IsOptional, IsDate } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MiningDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  chatId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  balance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start_time?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  end_time?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  gv3n_mined?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: string;
}
