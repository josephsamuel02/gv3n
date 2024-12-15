import { BadRequestException, Injectable } from "@nestjs/common";
import { MiningDto } from "src/dtos/mining.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "../user/user.service";

@Injectable()
export class MiningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly user: UserService,
  ) {}

  async startMining(miningDto: MiningDto): Promise<any> {
    const { chatId, start_time, end_time, status } = miningDto;
    const coin_mined = 10;
    try {
      const existingMiningRecord = await this.prisma.mining_Record.findUnique({
        where: { chatId },
      });

      if (!existingMiningRecord) {
        throw new BadRequestException("Mining record not found");
      }

      // Update the Mining_Record and create a new history entry
      const updateRecord = await this.prisma.mining_Record.update({
        where: { chatId },
        data: {
          status,
          balance: {
            increment: coin_mined,
          },
          history: {
            create: {
              chatId,
              start_time,
              end_time,
              gv3n_mined: coin_mined,
            },
          },
        },
      });

      const invited_by = await this.prisma.user.findUnique({
        where: {
          chatId: chatId.toString(),
        },
      });

      if (invited_by.invited_by) {
        const percentage = 30; // Replace with the percentage you want to calculate

        const result = (percentage / 100) * coin_mined;

        await this.prisma.mining_Record.update({
          where: { chatId: invited_by.invited_by },
          data: {
            balance: {
              increment: result,
            },
          },
        });
      }

      return updateRecord;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to start mining",
        error: error.message,
      });
    }
  }

  async getMiningHistoryByChatId(chatId: string): Promise<any> {
    try {
      // Check if the mining record exists
      const miningRecord = await this.prisma.mining_Record.findUnique({
        where: { chatId },
        include: { history: true },
      });

      if (!miningRecord) {
        throw new BadRequestException(
          `Mining record with chatId ${chatId} not found.`,
        );
      }

      return miningRecord.history;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to retrieve mining history",
        error: error.message,
      });
    }
  }

  async updateMiningStatus({ chatId, status }): Promise<any> {
    try {
      const response = await this.prisma.mining_Record.update({
        where: { chatId },
        data: {
          status,
        },
      });
      console.log(response);
      return response;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to update minings status",
        error: error.message,
      });
    }
  }

  async checkMiningInProgress(chatId: string): Promise<boolean> {
    try {
      const miningRecord = await this.prisma.mining_Record.findFirst({
        where: {
          chatId,
          status: "in_progress", // Checking if the status is in progress
        },
      });

      if (!miningRecord) {
        return {
          message: "No mining in progress",
          mining_status: false,
        } as any;
      }

      // At least one record has 'in_progress' status
      return { message: "Mining in progress", mining_status: true } as any;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to check mining record history",
        error: error.message,
      });
    }
  }
}
