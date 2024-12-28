import { PipelineStage } from "mongoose";
import { userFilterableFields } from "./user.interface";

export const userFinderAggregationBuilder = (
  searchableFields: string[],
  searchString: string,
  filterOption: Record<string, string>
): PipelineStage[] => {
  const pipelineStage = [];
  const lookUpStage = [
    {
      $lookup: {
        from: "users",
        localField: "uuid",
        foreignField: "uuid",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "user.branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    {
      $unwind: {
        path: "$branch",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "user.password": 0,
      },
    },
  ];
  pipelineStage.push(...lookUpStage);

  let searchStage;

  if (searchableFields.length && searchString) {
    searchStage = {
      $match: {
        $or: searchableFields.map((field) => ({
          [field]: {
            $regex: new RegExp(searchString),
            $options: "i",
          },
        })),
      },
    };
    pipelineStage.push(searchStage);
  }

  if (filterOption) {
    pipelineStage.push({
      $match: {
        ...userFilterableFields.reduce((acc: Record<string, string>, field) => {
          if (filterOption[field]) {
            acc["user." + field] = filterOption[field];
          }
          return acc;
        }, {}),
      },
    });
  }
  return pipelineStage;
};
