import { forwardRef, Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TelegramController } from "./telegram.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { MiningModule } from "../Mining/mining.module";
import { MiningService } from "../Mining/mining.service";
import { BullModule } from "@nestjs/bull";
import {
  MiningConsumer,
  miningHistory,
  MiningStatusConsumer,
  UpdateMiningStatusConsumer,
  UpdateUserDataConsumer,
} from "./consumer";
import { EncryptionService } from "src/shared";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    // TelegrafModule.forRootAsync({
    //   useFactory: () => ({
    //     token: process.env.TELEGRAM_BOT_TOKEN,
    //     options: {
    //       telegram: {
    //         apiRoot: "https://api.telegram.org",
    //         timeout: 10000, // 10 seconds
    //       },
    //     },
    //     // launchOptions: {
    //     //   webhook: {
    //     //     domain: process.env.WEBHOOK_URL, // Public domain where Telegram will send updates
    //     //     hookPath: "/telegram/webhook", // Webhook endpoint path
    //     //   },
    //     // },
    //   }),
    // }),

    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      }),
    }),

    BullModule.registerQueueAsync(
      {
        name: "mining-queue",
      },
      {
        name: "mining-history-queue",
      },
      {
        name: "update_mining-status-queue",
      },
      {
        name: "mining-status-queue",
      },
      {
        name: "update_user_data-queue",
      },
    ),
    forwardRef(() => UserModule),
    MiningModule,
  ],
  providers: [
    TelegramService,
    TelegramController,
    PrismaService,
    UserService,
    MiningService,
    MiningConsumer,
    MiningStatusConsumer,
    miningHistory,
    UpdateUserDataConsumer,
    UpdateMiningStatusConsumer,
    EncryptionService,
    JwtService,
  ],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
