/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

// Define a valid middleware function signature
const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "API Not Found !!",
    error: "",
  });
};

export default notFound;
