import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "src/dtos";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  public async signUp(@Body() body: CreateUserDto): Promise<any> {
    return await this.userService.signUp(body);
  }

  @Post("login")
  public async login(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.userService.login(createUserDto);
  }

  // this id for gv3n bot user data
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAllUser();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOneUser(id);
  }
}
