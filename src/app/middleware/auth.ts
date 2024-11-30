import { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../helpers/jwtHelpers";
import config from "../config";
import { Secret } from "jsonwebtoken";
import { ENUM_USER_PERMISSION } from "../enums/enumUserPermission";

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      req.user = verifiedUser; // role  , userid

      if (verifiedUser?.role == ENUM_USER_PERMISSION.SUPER_ADMIN) {
        next();
        return;
      }
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser?.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You are not authorized to perform this action"
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
