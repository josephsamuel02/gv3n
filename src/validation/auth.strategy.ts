import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/modules/user/user.service";

require("dotenv").config();

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignorExpiration: false,
      secretOrKey: process.env.JWT_SECRETE_KEY,
    });
  }

  async validate(payload: any): Promise<any> {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException({ message: "Invalid token payload" });
    }

    const userByUserId = await this.userService.validateUser(payload.userId);

    if (!userByUserId) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }
    return userByUserId;
  }
}
