import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { Context } from "telegraf";
import { Ctx } from "@maks1ms/nestjs-telegraf";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class TelegramService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getProfilePic(@Ctx() ctx: Context): Promise<void> {
    try {
      const userinfo = ctx.from;
      // Get User Profile Photos
      const profilePhotos = await ctx.telegram.getUserProfilePhotos(
        userinfo.id,
      );

      let profileImage = "";
      if (profilePhotos.total_count > 0) {
        // Get the File ID of the First Photo
        const fileId = profilePhotos.photos[0][0].file_id;

        // Get File Information
        const file = await ctx.telegram.getFile(fileId);

        // Construct the File URL
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // Download the Image (Optional)
        const imagePath = path.resolve(__dirname, `profile_${userinfo.id}.jpg`);
        const response = await axios.get(fileUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        // Assign the URL as Profile Image
        profileImage = fileUrl;
        console.log(fileUrl);
        // Cleanup Local File (Optional)
        fs.unlinkSync(imagePath);
      }
      return profileImage as any;
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }
}
