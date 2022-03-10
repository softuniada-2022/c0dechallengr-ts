import "reflect-metadata";
import { createConnection, useContainer as typeormUseContainer } from "typeorm";
import { UserRole, User } from "./entity/User";
import { Exercise } from "./entity/Exercise";
import { createClient } from "redis";
import {
  useContainer as rcUseContainer,
  createExpressServer,
} from "routing-controllers";
import { Container as typediContainer } from "typedi";
import { Container as extContainer } from "typeorm-typedi-extensions";
import { SessionService } from "./service/SessionService";
import {
  ExerciseController,
  LoginController,
  SolutionController,
  UserController,
} from "./controller/";
import * as cookieParser from "cookie-parser";
import { PlainTextErrorMiddleware } from "./middleware/PlainTextErrorMiddleware";
import { NotFoundToIndexMiddleware } from "./middleware/NotFoundToIndexMiddleware";
import * as express from "express";

Error.stackTraceLimit = Infinity;

async function main() {
  typeormUseContainer(extContainer);
  rcUseContainer(typediContainer);

  const connection = await createConnection();
  await connection.query("CREATE DATABASE IF NOT EXISTS c0dechallengr;");
  const redisConnection = await createClient({
    url: "redis://redis:6379",
  });
  await redisConnection.connect();

  typediContainer.set("redis", redisConnection);
  typediContainer.set("defaultRoles", [
    UserRole.ExerciseAuthor,
    UserRole.ExerciseSolver,
    UserRole.UserEditor,
    UserRole.UserRemover,
    UserRole.ExerciseEditor,
    UserRole.ExerciseRemover,
  ]);

  const sessionService = typediContainer.get(SessionService);

  const userRepo = connection.getRepository(User);
  const exRepo = connection.getRepository(Exercise);
  // insert new users for test
  const admin = User.from({
    username: "admin",
    password: "admin",
    email: "admin@example.com",
  });
  admin.roles = [UserRole.Admin];
  await userRepo.save(admin);

  const joe = User.from({
    username: "joe",
    password: "joe",
    email: "joe@example.com",
  });
  joe.roles = typediContainer.get("defaultRoles");
  await userRepo.save(joe);

  if ((await exRepo.count()) === 0) {
    await exRepo.save(
      Exercise.from({
        name: "this should be a simple one",
        description: "just do whatever the input says",
        answer: "qwerty",
        author: joe,
        difficulty: 1,
        input: "the first 6 keys on your keyboard",
      })
    );
    await exRepo.save(
      Exercise.from({
        name: "a harder one",
        description: "your credit card number hehe",
        answer: "12345",
        author: joe,
        difficulty: 2,
        input: "just the first 5 digits",
      })
    );
  }

  const cp = cookieParser();
  const app = createExpressServer({
    routePrefix: "/api",
    controllers: [
      UserController,
      ExerciseController,
      LoginController,
      SolutionController,
    ],
    authorizationChecker: async (action, roles) => {
      // a shim for cookies, since cookieParser is not working in this context somehow
      await new Promise((resolve) =>
        cp(action.request, action.response, resolve)
      );
      const session = action.request.cookies["session"];
      if (!session) return false;
      const claim = await sessionService.verifySession(session);
      if (!claim) return false;
      if (roles.length === 0) return true;
      return claim.roles.some((role) => roles.includes(role));
    },
    currentUserChecker: async (action) => {
      // a shim for cookies, since cookieParser is not working in this context somehow
      await new Promise((resolve) =>
        cp(action.request, action.response, resolve)
      );
      const session = action.request.cookies["session"];
      if (!session) return null;
      const claim = await sessionService.verifySession(session);
      if (!claim) return null;
      const user = await userRepo.findOneOrFail(claim.sub).catch(() => null);
      return user;
    },
    middlewares: [cp, PlainTextErrorMiddleware, NotFoundToIndexMiddleware],
    defaultErrorHandler: false,
  });
  // serve static from dist/
  app.use(express.static("dist"));
  app.listen(8000, () => console.log("Listening on http://localhost:8000"));
}

main().catch((err) => console.error(err));
