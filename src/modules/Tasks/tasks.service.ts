import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TasksDto } from "src/dtos";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  public async createTasks(tasksDtos: TasksDto[]): Promise<any> {
    try {
      const results = [];
      const date = new Date();
      for (const taskDto of tasksDtos) {
        try {
          console.log(date);

          const createTask = await this.prisma.tasks.create({
            // data: taskDto,
            data: {
              ...taskDto,
              start_date: date,
              end_date: date,
            },
          });
          results.push({ success: true, task: createTask });
        } catch (error) {
          results.push({ success: false, error: error.message, task: taskDto });
        }
      }

      return {
        status: 200,
        message: "Tasks processed",
        results: results,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getTaskOfTheDay(): Promise<any> {
    try {
      const todaysDate = new Date();

      const getTaskOfTheDay = await this.prisma.tasks.findMany({
        where: {
          end_date: {
            gt: todaysDate,
          },
        },
      });

      if (!getTaskOfTheDay) {
        throw new NotFoundException({
          message: "Unable to get tasks",
        });
      }

      return {
        status: 200,
        message: "Success",
        data: getTaskOfTheDay,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getAllTasks(): Promise<any> {
    try {
      const getAllTasks = await this.prisma.tasks.findMany();

      if (!getAllTasks) {
        throw new NotFoundException({
          message: "Unable to get tasks",
        });
      }

      return {
        status: 200,
        message: "Success",
        data: getAllTasks,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async updateTask(tasksDtos: TasksDto): Promise<any> {
    try {
      const { id, ...others } = tasksDtos;
      const updateTask = await this.prisma.tasks.update({
        where: {
          id: id,
        },
        data: others,
      });

      if (!updateTask) {
        throw new NotFoundException({
          message: "Unable to update tasks",
        });
      }

      return {
        status: 200,
        message: "Success",
        data: updateTask,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async deleteTask(id: number): Promise<any> {
    try {
      const deleteTask = await this.prisma.tasks.delete({
        where: {
          id: id,
        },
      });

      if (!deleteTask) {
        throw new NotFoundException({
          message: "Unable to delete tasks",
        });
      }

      return {
        status: 200,
        message: "Success",
        data: deleteTask,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // create cron job to handle old task deletion
}
