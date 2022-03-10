import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  NotFoundError,
  Param,
  Post,
  QueryParam,
  UnauthorizedError,
} from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Exercise } from "../entity/Exercise";
import { NewSolution, Solution } from "../entity/Solution";
import { User, UserRole } from "../entity/User";

@JsonController("/solutions")
@Service()
export class SolutionController {
  constructor(
    @InjectRepository(Solution)
    private readonly solutionRepository: Repository<Solution>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Get("/")
  async all(
    @QueryParam("exerciseId") exerciseId: number,
    @CurrentUser() currentUser: User,
    @QueryParam("limit", { required: false }) limit?: number,
    @QueryParam("skip", { required: false }) skip?: number
  ) {
    const solutions = await this.solutionRepository.find({
      where: {
        exercise: {
          id: exerciseId,
        },
        author: {
          username: currentUser.username,
        },
      },
      take: limit || undefined,
      skip: skip || undefined,
      order: {
        createdAt: "DESC",
      },
    });
    return solutions;
  }

  @Get("/:id")
  @Authorized()
  async one(@Param("id") id: number, @CurrentUser() currentUser: User) {
    const solution = await this.solutionRepository
      .findOneOrFail(id)
      .catch(() => {
        throw new NotFoundError();
      });
    if (
      solution.authorId !== currentUser.username &&
      !currentUser.roles.includes(UserRole.Admin)
    ) {
      throw new UnauthorizedError(
        "You are not authorized to view this solution"
      );
    }
    return solution;
  }

  @Post("/")
  @Authorized([UserRole.Admin, UserRole.ExerciseSolver])
  async create(
    @QueryParam("exerciseId") exerciseId: number,
    @CurrentUser() currentUser: User,
    @Body({ required: true }) solution: NewSolution
  ) {
    const exercise = await this.exerciseRepository
      .findOneOrFail(exerciseId)
      .catch(() => {
        throw new NotFoundError();
      });
    const newSolution = Solution.from(solution, exercise, currentUser);
    const alreadySolved =
      (await this.solutionRepository.count({
        where: {
          exercise: {
            id: exerciseId,
          },
          author: {
            username: currentUser.username,
          },
          correct: true,
        },
      })) > 0;
    if (newSolution.correct && !alreadySolved) {
      currentUser.score += exercise.difficulty;
      await this.userRepository.save(currentUser);
    }
    return await this.solutionRepository.save(newSolution);
  }
}
