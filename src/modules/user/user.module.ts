import { Module, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";
import { TelegrafModule } from "@maks1ms/nestjs-telegraf";
import { MiningModule } from "../Mining/mining.module";
import { EncryptionService } from "src/shared";
import { JwtModule } from "@nestjs/jwt";
import { AuthStrategy } from "src/validation/auth.strategy";
import { PrismaService } from "src/prisma/prisma.service";
require("dotenv").config();

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [
    PrismaModule,
    TelegrafModule,
    MiningModule,
    forwardRef(() => TelegramModule),
    JwtModule.register({
      secret: process.env.JWT_SECRETE_KEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPR_TIME,
      },
    }),
  ],
  providers: [UserService, PrismaService, EncryptionService, AuthStrategy],
})
export class UserModule {}
