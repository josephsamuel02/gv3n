import { Module } from "@nestjs/common";
import { UserModule } from "./modules/user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TelegramModule } from "./modules/telegram/telegram.module";
import { MiningModule } from "./modules/Mining/mining.module";
import { TasksModule } from "./modules/Tasks/tasks.module";
// import { Bull_Module } from "./modules/bull/bull.module";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TelegramModule,
    MiningModule,
    TasksModule,
  ],
})
export class AppModule {}
