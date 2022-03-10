import { NextFunction, Request, Response } from "express";
import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from "routing-controllers";
import { Service } from "typedi";

@Middleware({ type: "after" })
@Service()
export class PlainTextErrorMiddleware
  implements ExpressErrorMiddlewareInterface
{
  error(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    response.header("Content-Type", "text/plain");
    // console.error(error);
    response.status(error.httpCode || 500).send(error.message);
    if (!error.httpCode || error.httpCode === 500) console.error(error);
    next();
  }
}
