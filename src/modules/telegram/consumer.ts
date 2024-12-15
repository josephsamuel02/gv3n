import { Processor, Process } from "@nestjs/bull";
import { BadRequestException, Logger } from "@nestjs/common";
import { Job } from "bull";
import { MiningService } from "../Mining/mining.service";
import * as dotenv from "dotenv";
import { UserService } from "../user/user.service";
import { CreateUserDto } from "src/dtos";

dotenv.config();

@Processor("update_user_data-queue")
export class UpdateUserDataConsumer {
  constructor(private readonly userService: UserService) {}

  @Process("refer_user")
  async referUser(job: Job<{ userinfo: any }>) {
    const { userinfo } = job.data;
    // username, invited_by , chatId

    try {
      const referral = await this.userService.createReferral({
        chatId: userinfo.invited_by.toString(),
        invited_user_id: userinfo.chatId.toString(),
        user_name: userinfo.first_name,
      });

      return {
        status: 200,
        message: "Account created successfully",
        data: referral,
      };
    } catch (error) {
      // Handle any errors and notify the user
      return {
        message: "Unable to crete account ",
        data: error,
      };
    }
  }

  @Process("create_user")
  async creteUser(job: Job<{ createUserDto: CreateUserDto }>) {
    const { createUserDto } = job.data;

    try {
      const user = await this.userService.createUser({
        chatId: createUserDto.chatId.toString(),
        username: createUserDto.username,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        ...createUserDto,
      });
      console.log(user);

      return {
        status: 200,
        message: "Account created successfully",
        data: user,
      };
    } catch (error) {
      // Handle any errors and notify the user
      return {
        message: "Unable to crete account ",
        data: error,
      };
    }
  }
}

@Processor("mining-queue")
export class MiningConsumer {
  // private readonly logger = new Logger(MiningConsumer.name);

  constructor(private readonly miningService: MiningService) {}

  @Process("start-mining")
  async handleMiningJob(
    job: Job<{
      chatId: string;
      start_time: Date;
      end_time: Date;
    }>,
  ) {
    try {
      const { chatId, start_time, end_time } = job.data;
      // mining logic
      await this.miningService.startMining({
        chatId,
        start_time,
        end_time,
        status: "complete",
      });

      // return {
      //   chatId,
      //   status: 200,
      //   message: "Mining job completed",
      //   data: result,
      // };
    } catch (error) {
      return error;
    }
  }
}

@Processor("mining-history-queue")
export class miningHistory {
  private readonly logger = new Logger(MiningConsumer.name);

  constructor(private readonly miningService: MiningService) {}

  @Process("mining-history")
  async fetchMiningHistoryJob(job: Job<{ chatId: string }>) {
    const { chatId } = job.data;
    try {
      // console.log("Telegram Context:", telegramCtx);
      // Call your mining logic here
      const result = await this.miningService.getMiningHistoryByChatId(chatId);

      return {
        status: 200,
        message: "Mining record fetched successfully",
        data: result,
      };
    } catch (error) {
      // Handle any errors and notify the user
      return {
        error,
        message: "Failed to check mining status. Please try again.",
      };
    }
  }
}

@Processor("update_mining-status-queue")
export class UpdateMiningStatusConsumer {
  constructor(private readonly miningService: MiningService) {}

  @Process("update-mine-status")
  async handleMiningStatusCheck(job: Job<{ chatId: string; status: string }>) {
    try {
      const { chatId, status } = job.data;

      const response = await this.miningService.updateMiningStatus({
        chatId: chatId,
        status: status,
      });

      return response;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to update minings status",
        error: error.message,
      });
    }
  }
}

@Processor("mining-status-queue")
export class MiningStatusConsumer {
  constructor(private readonly miningService: MiningService) {}

  @Process("check-mining-status")
  async handleMiningStatusCheck(job: Job<{ chatId: string }>) {
    try {
      const { chatId } = job.data;
      const status = await this.miningService.checkMiningInProgress(chatId);

      return {
        status: 200,
        data: status,
      };
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to get minings status",
        error: error.message,
      });
    }
  }
}

@Processor("get_task_of_the_day")
export class GetTaskOfTheDayConsumer {
  constructor(private readonly miningService: MiningService) {}

  @Process("get_todays_task")
  async handleMiningStatusCheck(job: Job<{ chatId: string }>) {
    const { chatId } = job.data;

    try {
      const status = await this.miningService.checkMiningInProgress(chatId);

      // Send the status back to the user via Telegram
      // await this.bot.telegram.sendMessage(
      //   chatId,
      //   JSON.stringify({
      //     status: 200,
      //     data: status,
      //   }),
      // );

      return {
        status: 200,
        data: status,
      };
    } catch (error) {
      // Handle any errors and notify the user
      return {
        error,
        message: "Failed to check mining status. Please try again.",
      };
    }
  }
}
