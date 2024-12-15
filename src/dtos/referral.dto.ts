import { IsNotEmpty, IsString } from "class-validator";

export class ReferralDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  invited_user_id?: string;

  @IsString()
  @IsNotEmpty()
  user_name?: string;
}
