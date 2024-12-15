import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TasksDto {
  @ApiPropertyOptional()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  platform: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  end_date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
