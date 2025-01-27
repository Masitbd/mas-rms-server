import { StatusCodes } from "http-status-codes";
import { generateBranchId } from "../../../utils/generateUniqueId";
import AppError from "../../errors/AppError";
import { TBranch } from "./branch.interface";
import { Branch } from "./branch.model";

const createBranchIntoDB = async (payload: TBranch) => {
  payload.bid = await generateBranchId();
  const result = await Branch.create(payload);
  return result;
};

// get all brach

const getAllBranchFromDB = async () => {
  const result = await Branch.find();
  return result;
};

//  get single

const getSingleBranchFromDB = async (id: string) => {
  const result = await Branch.findById(id);
  return result;
};

//  update

const updateBranchIntoDB = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// delete

const deleteBranchFromDB = async (id: string) => {
  const result = await Branch.findByIdAndDelete(id);
  return result;
};

const getDeliverableCity = async (division: string) => {
  return await Branch.aggregate([
    {
      $match: {
        division: division,
        isActive: true,
        availability: { $ne: "offline" },
      },
    },
    {
      $group: {
        _id: null,
        city: {
          $push: "$city",
        },
      },
    },
  ]);
};

const getDeliveryZones = async (division: string, city: string) => {
  return await Branch.aggregate([
    {
      $match: {
        division: division,
        city: city,
        isActive: true,
        availability: { $ne: "offline" },
      },
    },
    {
      $group: {
        _id: null,
        deliveryLocations: {
          $push: "$deliveryLocations",
        },
      },
    },
    {
      $project: {
        _id: 1,
        deliveryLocations: {
          $reduce: {
            input: "$deliveryLocations",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);
};

const getDoesDeliver = async (location: string) => {
  if (!location) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "We Don't deliver to your location"
    );
  }
  const doesExists = await Branch.find({ deliveryLocations: location });
  if (doesExists.length) {
    return "Yes We Deliver to Your Location";
  } else {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "We Don't deliver to your location"
    );
  }
};
export const BranchSerives = {
  createBranchIntoDB,
  getAllBranchFromDB,
  getSingleBranchFromDB,
  updateBranchIntoDB,
  deleteBranchFromDB,
  getDeliverableCity,
  getDeliveryZones,
  getDoesDeliver,
};
