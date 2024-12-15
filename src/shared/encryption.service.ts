import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
require("dotenv").config();
@Injectable()
export class EncryptionService {
  constructor() {}

  public hashPassword = async (password: string) => {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  };

  public comparePasswords = async (
    password: string | Buffer,
    hashedPassword: string,
  ) => {
    return await bcrypt.compare(password, hashedPassword);
  };
}
