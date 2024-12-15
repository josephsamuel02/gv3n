import { Injectable, Logger } from "@nestjs/common";
import { Context, Telegraf } from "telegraf";
import { InjectBot } from "@maks1ms/nestjs-telegraf";

import * as schedule from "node-schedule";
import { MiningService } from "../Mining/mining.service";

@Injectable()
export class MiningJobSchedule {
  private readonly logger = new Logger(MiningJobSchedule.name);

  constructor(
    private readonly miningService: MiningService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async scheduleMiningJob(chatId: string, startTime: Date, endTime: Date) {
    // Schedule mining job start

    schedule.scheduleJob(startTime, async () => {
      try {
        await this.miningService.startMining({
          chatId,
          start_time: startTime,
          end_time: endTime,
          status: "complete",
        });

        // await telegramCtx.telegram.sendMessage(
        //   chatId,
        //   JSON.stringify({
        //     status: 200,
        //     message: "Mining job started and completed",
        //     data: result,
        //   }),
        // );
      } catch (error) {
        this.logger.error(`Error executing mining job: ${error.message}`);
        return error.message;
      }
    });
    await this.bot.telegram.sendMessage(
      chatId,
      JSON.stringify({
        message: "Mining job has been scheduled and started.",
        status: 200,
      }),
    );

    this.logger.log(`Scheduling mining job for chatId: ${chatId}`);

    schedule.scheduleJob(endTime, async () => {
      await this.miningService.updateMiningStatus({
        chatId,
        status: "none",
      });
      await this.bot.telegram.sendMessage(chatId, "Mining job duration ended.");
    });
  }

  async fetchMiningHistory(chatId: string, telegramCtx: Context) {
    try {
      const result = await this.miningService.getMiningHistoryByChatId(chatId);

      await telegramCtx.reply(
        JSON.stringify({
          status: 200,
          message: "Mining record fetched successfully",
          data: result,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to fetch mining history: ${error.message}`);
      await telegramCtx.reply("Failed to fetch mining history. Try again.");
    }
  }

  async checkMiningStatus(chatId: string, telegramCtx: Context) {
    try {
      const status = await this.miningService.checkMiningInProgress(chatId);

      await telegramCtx.telegram.sendMessage(
        chatId,
        JSON.stringify({
          status: 200,
          data: status,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to check mining status: ${error.message}`);
      await telegramCtx.reply(
        "Failed to check mining status. Please try again later.",
      );
    }
  }
}
