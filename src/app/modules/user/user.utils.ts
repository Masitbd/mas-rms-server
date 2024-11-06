import { User } from "./user.model";

// Last user ID
export const findLastUserUUIid = async (): Promise<string | undefined> => {
  const lastUser = await User.findOne()
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastUser?.uuid ? lastUser.uuid.substring(6) : undefined;
};

export const generateUUid = async (): Promise<string> => {
  const currentId =
    (await findLastUserUUIid()) || (0).toString().padStart(5, "0"); //00000
  //increment by 1
  let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, "0");
  //20 25
  incrementedId = `${"U-"}${incrementedId}`;

  return incrementedId;
};
