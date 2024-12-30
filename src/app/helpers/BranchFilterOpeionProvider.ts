import { JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../enums/EnumUser";
import { Types } from "mongoose";

export const branchFilterOptionProvider = (user: JwtPayload) => {
  const filterOption = [];
  if (
    user?.role !== ENUM_USER.ADMIN &&
    user?.role !== ENUM_USER.SUPER_ADMIN &&
    user?.branch
  ) {
    filterOption.push(
      ...[
        { branch: new Types.ObjectId(user?.branch) },
        { branch: { $exists: false } },
      ]
    );
  }

  return filterOption?.length > 0 ? { $or: filterOption } : {};
};
