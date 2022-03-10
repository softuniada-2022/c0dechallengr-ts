import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";

@Middleware({ type: "after" })
@Service()
export class NotFoundToIndexMiddleware implements ExpressMiddlewareInterface {
  public use(request: Request, response: Response, next: NextFunction) {
    if (response.statusCode === 404) {
      response.sendFile("index.html", { root: "dist" });
    } else {
      next();
    }
  }
}
