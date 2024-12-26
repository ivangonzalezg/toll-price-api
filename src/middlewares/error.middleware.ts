import { Request, Response } from "express";

const errorMiddleware = (_: Request, res: Response) => {
  if (res.errored) {
    console.error(res.errored);
  }
};

export default errorMiddleware;
