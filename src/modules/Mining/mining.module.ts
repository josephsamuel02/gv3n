import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";
import { TelegrafModule } from "@maks1ms/nestjs-telegraf";
import { UserController } from "../user/user.controller";
import { UserService } from "../user/user.service";
import { MiningService } from "./mining.service";
import { EncryptionService } from "src/shared";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [UserController],
  providers: [UserService, MiningService, EncryptionService, JwtService],
  exports: [UserService],
  imports: [PrismaModule, TelegrafModule, forwardRef(() => TelegramModule)],
})
export class MiningModule {}
