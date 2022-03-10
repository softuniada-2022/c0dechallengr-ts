import { Inject, Service } from "typedi";
import {
  JsonController,
  QueryParam,
  Param,
  Body,
  Get,
  Post,
  Patch,
  Delete,
  Authorized,
  CurrentUser,
  UnauthorizedError,
  NotFoundError,
} from "routing-controllers";
import { InjectRepository } from "typeorm-typedi-extensions";
import { NewUser, User, UserRole } from "../entity/User";
import { Repository } from "typeorm";
import { SessionService } from "../service/SessionService";

enum SortField {
  Username = "username",
  Score = "score",
  CreatedAt = "createdAt",
}

@JsonController("/users")
@Service()
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject("defaultRoles")
    private readonly defaultRoles: UserRole[],
    private readonly sessionService: SessionService
  ) {}

  @Get("/")
  async all(
    @QueryParam("limit", { required: false }) limit?: number,
    @QueryParam("skip", { required: false }) skip?: number,
    @QueryParam("sort", { required: false }) sort?: SortField,
    @QueryParam("order", { required: false })
    order?: "ASC" | "DESC" | "asc" | "desc"
  ) {
    const sortFields = ["username", "score", "createdAt"];
    const sortBy: SortField = sortFields.includes(sort)
      ? sort
      : SortField.CreatedAt;
    const orderBy = ["ASC", "DESC"].includes(order?.toUpperCase())
      ? order.toUpperCase()
      : "DESC";
    const users = await this.userRepository.find({
      order: {
        [sortBy]: orderBy,
      },
      take: limit || undefined,
      skip: skip || undefined,
    });
    return users;
  }

  @Get("/:name")
  async one(@Param("name") username: string) {
    const user = await this.userRepository.findOneOrFail(username).catch(() => {
      throw new NotFoundError();
    });
    return user;
  }

  @Post("/")
  async create(@Body({ required: true }) newUser: NewUser) {
    const user = User.from(newUser);
    user.roles = this.defaultRoles;
    return await this.userRepository.save(user);
  }

  @Patch("/:name")
  @Authorized([UserRole.Admin, UserRole.UserEditor])
  async patch(
    @Param("name") name: string,
    @Param("name") username: string,
    @Body({ required: true }) update: Partial<NewUser>,
    @CurrentUser() currentUser: User
  ) {
    if (
      currentUser.username !== name &&
      !currentUser.roles.includes(UserRole.Admin)
    ) {
      throw new UnauthorizedError("You are not allowed to edit this user");
    }
    const user = await this.userRepository.findOneOrFail(username).catch(() => {
      throw new NotFoundError();
    });
    Object.assign(user, update);
    await this.userRepository.save(user);
    return "";
  }

  @Delete("/:name")
  @Authorized([UserRole.Admin, UserRole.UserRemover])
  async remove(
    @Param("name") username: string,
    @CurrentUser() currentUser: User
  ) {
    if (
      currentUser.username !== username &&
      !currentUser.roles.includes(UserRole.Admin)
    ) {
      throw new UnauthorizedError("You are not allowed to remove this user");
    }
    const user = await this.userRepository.findOneOrFail(username).catch(() => {
      throw new NotFoundError();
    });
    await this.userRepository.remove(user);
    await this.sessionService.destroyUserSessions(username);
    return "";
  }
}
