import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Logger,
  Param,
  Post,
} from "@nestjs/common";
import * as dotenv from "dotenv";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { CreateUserDto, MiningDto } from "src/dtos";
dotenv.config();

@ApiTags("telegram")
@Controller("telegram")
@Injectable()
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);
  constructor(
    @InjectQueue("mining-queue") private readonly miningQueue: Queue,
    @InjectQueue("update_mining-status-queue")
    private readonly updateMiningStatusQue: Queue,
    @InjectQueue("mining-history-queue")
    private readonly miningHistoryQueue: Queue,
    @InjectQueue("mining-status-queue")
    private readonly miningStatusQueue: Queue,
    @InjectQueue("update_user_data-queue")
    private readonly UpdateUserDataConsumer: Queue,
  ) {}

  @Post("start")
  @ApiOperation({ summary: "Start endpoint" })
  async start(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      const response = await this.UpdateUserDataConsumer.add("create_user", {
        createUserDto: createUserDto,
      });

      if (createUserDto.invited_by) {
        await this.UpdateUserDataConsumer.add("refer_user", {
          username: createUserDto.first_name,
          invited_by: createUserDto.invited_by,
          chatId: createUserDto.chatId,
        });
      }

      const result = await response.finished();
      return result;
    } catch (error) {
      console.error(error);
      return {
        data: error,
        message: "An error occurred",
      };
    }
  }

  @Post("mine")
  @ApiOperation({ summary: "Start mining endpoint" })
  async mineCommand(@Body() miningDto: MiningDto): Promise<any> {
    try {
      const { chatId } = miningDto;
      const now = new Date();
      const twentyFourHoursLater = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );
      const response = await this.updateMiningStatusQue.add(
        "update-mine-status",
        {
          chatId: chatId,
          status: "in_progress",
        },
      );
      this.miningQueue.add(
        "start-mining",
        {
          chatId: `${chatId}`,
          start_time: now,
          end_time: twentyFourHoursLater,
        },
        {
          // delay: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
          delay: 30000, // 4 seconds
        },
      );

      // this.logger.log(`Scheduling mining job for chatId: ${chatId}`);
      const result = await response.finished();
      return result;
    } catch (error) {
      console.error(error);
      return {
        data: error,
        message: "An error occurred",
      };
    }
  }

  @Get("mine_history/:chatId")
  @ApiOperation({ summary: "Get mining history by chatId" })
  async getMiningHistory(@Param("chatId") chatId: string): Promise<any> {
    try {
      if (!chatId) {
        throw new BadRequestException("chatId is required");
      }

      const response = await this.miningHistoryQueue.add("mining-history", {
        chatId: chatId,
      });

      const result = await response.finished();
      return result;
    } catch (error) {
      console.error("Error fetching mining history:", error);
      return {
        status: "error",
        message: "An error occurred while fetching mining history",
        error: error.message,
      };
    }
  }

  @Get("mine_status/:chatId")
  @ApiOperation({ summary: "Get mining status by chatId" })
  async checkMiningInProgress(@Param("chatId") chatId: string): Promise<any> {
    const response = await this.miningStatusQueue.add("check-mining-status", {
      chatId: chatId.toString(),
    });

    return await response.finished();
  }

  // @Command("start")
  // @ApiOperation({ summary: "Start command for referral to the bot" })
  // async referral(ctx: Context): Promise<any> {
  //   // https://t.me/YourBotUsername?start=12345
  //   // Here, 12345 is the inviter_id

  //   try {
  //     const userinfo = ctx.from;
  //     const messageText = ctx?.text || "";
  //     const inviterId = messageText.split(" ")[1];

  //     return this.UpdateUserDataConsumer.add("refer_user", {
  //       userinfo: userinfo,
  //       inviterId: inviterId,
  //     });

  //   } catch (error) {
  //     console.error(error);
  //     return {
  //       data: error,
  //       message: "An error occurred",
  //     };
  //   }
  // }

  // @Command("get_phone_request")
  // @ApiOperation({ summary: "Get phone number request" })
  // async startCommand(@Ctx() ctx: Context): Promise<any> {
  //   await ctx.reply(
  //     "Please share your phone number:",
  //     Markup.keyboard([Markup.button.contactRequest("📞 Share Contact")])
  //       .resize()
  //       .oneTime(),
  //   );
  // }

  // https://t.me/YourBotUsername?start=12345

  // https://api.telegram.org/bot<your_bot_token>/sendMessage?chat_id=<chat_id>&text=/start
}
