import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "src/dtos/createUser.dto";
import { UpdateUserDto } from "src/dtos/updateUser.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { TelegramService } from "../telegram/telegram.service";
import { ReferralDto } from "src/dtos/referral.dto";
import { EncryptionService } from "../../shared";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private encryptionService: EncryptionService,
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  public async signUp(createUserDto: CreateUserDto): Promise<any> {
    try {
      const userExist = await this.prisma.user.findFirst({
        where: {
          email: createUserDto.email,
        },
      });

      if (userExist) {
        throw new BadRequestException({
          message: "User with this email already exists",
        });
      }

      const { email, password } = createUserDto;

      const encryptedPass = await this.encryptionService.hashPassword(password);

      const newUser = await this.prisma.user.create({
        data: {
          userId: `${email + Math.random().toString(36).slice(2)}`,
          chatId: email,
          email: createUserDto.email,
          password: `${encryptedPass}`,
        },
      });

      if (!newUser) {
        throw new BadRequestException({
          message: "Unable to create user auth account",
        });
      }

      return {
        status: 200,
        message: "Account created successfully",
        userId: newUser.userId,
        user: newUser.email,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async login(createUserDto: CreateUserDto) {
    try {
      const { email } = createUserDto;
      const userExist = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!userExist) {
        throw new NotFoundException(
          `No user found for email: ${createUserDto.email}`,
        );
      }

      const isPasswordValid = await this.encryptionService.comparePasswords(
        createUserDto.password,
        userExist.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException({ message: "invalid credentials" });
      }
      const signedUserToken = this.jwtService.sign({
        userId: userExist.userId,
      });

      delete userExist.password;

      return {
        access_token: signedUserToken,
        status: 200,
        user: userExist,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async validateUser(userId: any) {
    try {
      const userExistByUserId = await this.prisma.user.findFirst({
        where: {
          userId: userId,
        },
      });

      if (!userExistByUserId) {
        throw new UnauthorizedException({ message: "can not find user" });
      } else {
        //  delete userExistByUserId.password;
        return userExistByUserId;
      }
    } catch (error) {
      throw new BadRequestException({
        error: error,
        message: "unable to validate user",
      });
    }
  }

  public async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const userExist = await this.prisma.user.findFirst({
        where: {
          chatId: createUserDto.chatId,
        },
      });

      if (userExist) {
        return userExist;
      }

      const createUser = await this.prisma.user.create({
        data: createUserDto,
      });

      if (!createUser) {
        throw new BadRequestException({
          message: "Unable to create useraccount",
        });
      }

      await this.prisma.mining_Record.create({
        data: {
          chatId: createUserDto.chatId,
          balance: 0, // Default balance set to 0
        },
      });

      return createUser;
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async createReferral(referralDto: ReferralDto): Promise<void> {
    const { chatId, user_name, invited_user_id } = referralDto;

    try {
      const existingReferral = await this.prisma.userReferral.findFirst({
        where: {
          chatId: referralDto.chatId,
          invited_user_id: referralDto.invited_user_id,
        },
      });

      if (existingReferral) {
        console.log("Referral already exists for this user.");

        return false as any;
      }

      await this.prisma.userReferral.create({
        data: {
          chatId,
          invited_user_id,
          username: user_name,
          referral_date: new Date(),
          referral_bonus: 10,
        },
      });

      const mining_Record = (await this.prisma.mining_Record.update({
        where: { chatId },
        data: {
          balance: {
            increment: 10,
          },
        },
        include: { history: true },
      })) as any;

      return mining_Record.history;
    } catch (error) {
      throw new BadRequestException({
        message: "Failed to create referral record.",
        error: error.message,
      });
    }
  }

  public async getReferrals(createUserDto: CreateUserDto) {
    const referrals = await this.prisma.userReferral.findMany({
      where: {
        chatId: createUserDto.chatId,
      },
    });

    if (!referrals) {
      throw new BadRequestException("Unable to get");
    }

    console.log(referrals);
    return referrals;
  }

  async findAllUser() {
    try {
      const users = await this.prisma.user.findMany();

      if (!users) {
        throw new NotFoundException("not found");
      }

      return { status: "success", data: users };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async findOneUser(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          chatId: id,
        },
      });

      if (!user) {
        throw new NotFoundException("user not found");
      }

      return { status: "success", data: user };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  updateUser(updateUserDto: UpdateUserDto) {
    return updateUserDto;
  }

  // async delete(id: number) {
  //   return await this.prisma.user.delete({ chatId: id });
  // }
}
