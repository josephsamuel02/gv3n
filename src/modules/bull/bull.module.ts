import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import * as dotenv from "dotenv";
import { QUES } from "src/commands/commands.bot";
dotenv.config();

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      }),
    }),

    BullModule.registerQueueAsync({
      name: QUES.LOG,
    }),
  ],
})
export class Bull_Module {}
