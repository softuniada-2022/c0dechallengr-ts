import {
  Authorized,
  Body,
  CookieParam,
  Delete,
  Get,
  JsonController,
  Post,
  Res,
  UnauthorizedError,
} from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { SessionService } from "../service/SessionService";
import { LoginUser, User } from "../entity/User";
import { Response } from "express";

@JsonController("/login")
@Service()
export class LoginController {
  constructor(
    private readonly sessionService: SessionService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  @Get("/")
  @Authorized()
  async getLogin(@CookieParam("session") token: string) {
    const claim = this.sessionService.verifySession(token);
    if (claim === null) throw new UnauthorizedError();
    return claim;
  }

  @Post("/")
  async login(
    @Res() res: Response,
    @Body({ required: true }) login: LoginUser
  ) {
    const user = await this.userRepository
      .findOneOrFail({ username: login.username })
      .catch(() => {
        throw new UnauthorizedError("Invalid credentials");
      });
    if (!User.verifyPassword(user, login.password)) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const token = await this.sessionService.createSession(user);
    res.cookie("session", token);
    return token;
  }

  @Delete("/")
  @Authorized()
  async logout(@Res() res: Response, @CookieParam("session") token: string) {
    await this.sessionService.destroySession(token);
    res.clearCookie("session");
    return "";
  }
}
