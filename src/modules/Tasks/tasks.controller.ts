import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { TasksDto } from "src/dtos";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  create(@Body() tasksDto: TasksDto) {
    return this.tasksService.createTasks([tasksDto]);
  }

  @Get("todays_task")
  getTaskOfTheDay() {
    return this.tasksService.getTaskOfTheDay();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("get_all_tasks")
  getAllTasks() {
    return this.tasksService.getAllTasks();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("update_task")
  updateTask(@Body() tasksDtos: TasksDto) {
    return this.tasksService.updateTask(tasksDtos);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("delete_task/:id")
  deleteTask(@Param("id") id: string) {
    return this.tasksService.deleteTask(Number(id));
  }
}
