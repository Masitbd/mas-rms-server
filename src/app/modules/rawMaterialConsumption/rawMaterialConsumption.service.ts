/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import MenuItemConsumption from "./rawMaterialConsumption.model";
import { IMenuItemConsumption } from "./rawMaterialConsumption.interface";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { ENUM_USER } from "../../enums/EnumUser";
import { generateUniqueId } from "../../../utils/generateUniqueId";

interface FetchAllParams {
  page?: number;
  limit?: number;
  search?: string;
  itemCategory?: string;
  itemGroup?: string;
}

class MenuItemConsumptionService {
  /**
   * Create a new menu item consumption
   * @param menuItemData - The menu item consumption data
   * @returns Promise<IMenuItemConsumption>
   */
  async create(
    menuItemData: IMenuItemConsumption,
    loggedInUserInfo: JwtPayload
  ): Promise<IMenuItemConsumption> {
    try {
      if (
        loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
        loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
      ) {
        menuItemData.branch = loggedInUserInfo?.branch;
      }
      const newId = await generateUniqueId<IMenuItemConsumption>(
        MenuItemConsumption,
        "I",
        4,
        "id"
      );
      menuItemData.id = newId;
      const savedMenuItem = await MenuItemConsumption.create(menuItemData);
      return savedMenuItem;
    } catch (error: any) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Error creating menu item consumption: ${error.message}`
      );
    }
  }

  /**
   * Update an existing menu item consumption
   * @param id - The ID of the menu item to update
   * @param updateData - The data to update
   * @returns Promise<IMenuItemConsumption | null>
   */
  async update(
    id: string,
    updateData: Partial<IMenuItemConsumption>
  ): Promise<IMenuItemConsumption | null> {
    try {
      const updatedMenuItem = await MenuItemConsumption.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return updatedMenuItem;
    } catch (error: any) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Error updating menu item consumption: ${error.message}`
      );
    }
  }

  /**
   * Fetch all menu item consumptions with optional pagination and search
   * @param params - Fetch parameters including page, limit, search, itemCategory, and itemGroup
   * @returns Promise<{ items: IMenuItemConsumption[], total: number, page: number, totalPages: number }>
   */
  async fetchAll(params: FetchAllParams = {}, loggedInUserInfo: JwtPayload) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        itemCategory,
        itemGroup,
      } = params;

      const skip = (page - 1) * limit;

      // Build query filters
      const query: any = {};

      // Add search filter
      if (search) {
        query.$or = [
          { itemName: { $regex: search, $options: "i" } },
          { itemCode: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
      // checking for branch
      if (
        loggedInUserInfo?.role !== ENUM_USER.ADMIN &&
        loggedInUserInfo?.role !== ENUM_USER.SUPER_ADMIN
      ) {
        query.$and = [{ branch: new Types.ObjectId(loggedInUserInfo?.branch) }];
      }

      // Add category filter
      if (itemCategory) {
        query.itemCategory = new Types.ObjectId(itemCategory);
      }

      // Add group filter
      if (itemGroup) {
        query.itemGroup = new Types.ObjectId(itemGroup);
      }

      // Get total count for pagination
      const total = await MenuItemConsumption.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Execute main query
      const items = await MenuItemConsumption.find(query)
        .populate("consumptions.item", "materialName")
        .sort({ itemName: 1 }) // Sort by itemName
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        items,
        total,
        page,
        totalPages,
        limit,
        hasMore: page < totalPages,
      };
    } catch (error: any) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Error fetching menu item consumptions: ${error.message}`
      );
    }
  }

  /**
   * Fetch a single menu item consumption by ID
   * @param id - The ID of the menu item to fetch
   * @returns Promise<IMenuItemConsumption | null>
   */
  async fetchById(id: string): Promise<IMenuItemConsumption | null> {
    try {
      const menuItem = await MenuItemConsumption.findById(id)
        .populate("consumptions.item")
        .lean();
      return menuItem;
    } catch (error: any) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Error fetching menu item consumption: ${error.message}`
      );
    }
  }

  /**
   * Delete a menu item consumption
   * @param id - The ID of the menu item to delete
   * @returns Promise<boolean>
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await MenuItemConsumption.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Error deleting menu item consumption: ${error.message}`
      );
    }
  }
}

export default new MenuItemConsumptionService();
