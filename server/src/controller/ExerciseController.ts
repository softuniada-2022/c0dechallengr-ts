import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Param,
  Post,
  QueryParam,
  HttpError,
  Delete,
  Authorized,
  UnauthorizedError,
  CookieParam,
  ContentType,
  NotFoundError,
} from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { SessionService } from "../service/SessionService";
import { Exercise, NewExercise } from "../entity/Exercise";
import { User, UserRole } from "../entity/User";
import { Like } from "../entity/Like";

enum SortField {
  LikeCount = "likeCount",
  CreatedAt = "createdAt",
}

@JsonController("/exercises")
@Service()
export class ExerciseController {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
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
    const sortFields = ["likeCount", "createdAt"];
    const sortBy: SortField = sortFields.includes(sort)
      ? sort
      : SortField.CreatedAt;
    const orderBy = ["ASC", "DESC"].includes(order?.toUpperCase())
      ? order.toUpperCase()
      : "DESC";
    const users = await this.exerciseRepository.find({
      order: {
        [sortBy]: orderBy,
      },
      take: limit || undefined,
      skip: skip || undefined,
    });
    return users;
  }

  @Get("/:id")
  async one(@Param("id") id: number) {
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    return exercise;
  }

  @Post("/")
  @Authorized([UserRole.Admin, UserRole.ExerciseAuthor])
  async create(
    @Body({ required: true }) newExercise: NewExercise,
    @CurrentUser() currentUser: User
  ) {
    const exercise = Exercise.from(newExercise);
    exercise.author = currentUser;
    return await this.exerciseRepository.save(exercise);
  }

  @Get("/:id/likes")
  async likes(@Param("id") id: number) {
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    return exercise.likeCount;
  }

  @Get("/:id/liked")
  @Authorized([UserRole.Admin, UserRole.ExerciseLiker])
  async liked(
    @Param("id") id: number,
    @CookieParam("session") session: string
  ) {
    const claim = await this.sessionService.verifySession(session).catch(() => {
      throw new UnauthorizedError();
    });
    return await this.likeRepository
      .findOneOrFail({
        where: {
          exercise: {
            id,
          },
          author: {
            username: claim.sub,
          },
        },
      })
      .then(() => true)
      .catch(() => false);
  }

  @Post("/:id/like")
  @Authorized([UserRole.Admin, UserRole.ExerciseLiker])
  async like(@Param("id") id: number, @CookieParam("session") session: string) {
    const claim = await this.sessionService.verifySession(session).catch(() => {
      throw new UnauthorizedError();
    });
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch((e) => {
        console.error({ e });
        throw new NotFoundError();
      });
    const like = new Like();
    like.authorId = claim.sub;
    like.exercise = exercise;
    try {
      await this.likeRepository.save(like);
      exercise.likeCount++;
      await this.exerciseRepository.save(exercise);
    } catch {
      throw new HttpError(409, "Already liked");
    }
    return "";
  }

  @Delete("/:id/like")
  @Authorized([UserRole.Admin, UserRole.ExerciseLiker])
  async unlike(
    @Param("id") id: number,
    @CookieParam("session") session: string
  ) {
    const claim = await this.sessionService.verifySession(session).catch(() => {
      throw new UnauthorizedError();
    });
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    const like = await this.likeRepository
      .findOneOrFail({
        where: {
          exercise: {
            id,
          },
          author: {
            username: claim.sub,
          },
        },
      })
      .catch(() => {
        throw new NotFoundError();
      });
    if (!like) {
      throw new NotFoundError("Not liked");
    } else {
      await this.likeRepository.remove(like);
      exercise.likeCount--;
      await this.exerciseRepository.save(exercise);
    }
    return "";
  }

  @Delete("/:id")
  @Authorized([UserRole.Admin, UserRole.ExerciseRemover])
  async remove(@Param("id") id: number, @CurrentUser() currentUser: User) {
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    if (
      currentUser.username !== exercise.authorId &&
      !currentUser.roles.includes(UserRole.Admin)
    ) {
      throw new UnauthorizedError(
        "You are not allowed to remove this exercise"
      );
    }
    await this.exerciseRepository.remove(exercise);
    return "";
  }

  @Get("/:id/input", { transformResponse: false })
  @Authorized([UserRole.Admin, UserRole.ExerciseSolver])
  @ContentType("text/plain")
  async input(@Param("id") id: number) {
    const exercise = await this.exerciseRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    return exercise.input;
  }
}
