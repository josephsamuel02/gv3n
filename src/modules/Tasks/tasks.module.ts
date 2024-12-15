import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";
import { TelegrafModule } from "@maks1ms/nestjs-telegraf";
import { MiningModule } from "../Mining/mining.module";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
  imports: [
    PrismaModule,
    TelegrafModule,
    MiningModule,
    forwardRef(() => TelegramModule),
  ],
})
export class TasksModule {}
