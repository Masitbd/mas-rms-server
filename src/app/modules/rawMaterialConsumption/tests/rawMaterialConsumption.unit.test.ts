// /* eslint-disable @typescript-eslint/no-explicit-any */
// import mongoose from "mongoose";
// import MenuItemConsumptionService from "../rawMaterialConsumption.service";
// import MenuItemConsumption from "../rawMaterialConsumption.model";
// import { IMenuItemConsumption } from "../rawMaterialConsumption.interface";

// jest.mock("../rawMaterialConsumption.model.ts", () => {
//   return {
//     __esModule: true,
//     default: {
//       create: jest.fn(),
//       find: jest.fn(),
//       findById: jest.fn(),
//       findByIdAndUpdate: jest.fn(),
//       findByIdAndDelete: jest.fn(),
//       countDocuments: jest.fn(),
//     },
//   };
// });

// // Mock data
// const mockItemGroup = new mongoose.Types.ObjectId();
// const mockItemCategory = new mongoose.Types.ObjectId();
// const mockItemId = new mongoose.Types.ObjectId();

// const mockMenuItemData: IMenuItemConsumption = {
//   id: "12345",
//   rate: 10.99,
//   itemGroup: mockItemGroup,
//   cookingTime: 15,
//   itemCategory: mockItemCategory,
//   isDiscount: false,
//   isVat: true,
//   isWaiterTips: false,
//   itemName: "Test Pizza",
//   itemCode: "PIZZA001",
//   description: "Delicious test pizza",
//   consumptions: [
//     {
//       item: mockItemId,
//       qty: 2,
//     },
//   ],
// };

// const mockMenuItems = [
//   mockMenuItemData,
//   {
//     ...mockMenuItemData,
//     id: "12346",
//     itemName: "Test Burger",
//     itemCode: "BURGER001",
//   },
// ];

// describe("MenuItemConsumptionService", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("create", () => {
//     it("should create a new menu item successfully", async () => {
//       // Mock the create method directly
//       (MenuItemConsumption.create as jest.Mock).mockResolvedValue(
//         mockMenuItemData
//       );

//       const result = await MenuItemConsumptionService.create(mockMenuItemData);

//       expect(result).toEqual(mockMenuItemData);
//       expect(MenuItemConsumption.create).toHaveBeenCalledWith(mockMenuItemData);
//     });

//     it("should throw an error if creation fails", async () => {
//       // Mock the create method to throw an error
//       (MenuItemConsumption.create as jest.Mock).mockRejectedValue(
//         new Error("Creation failed")
//       );

//       await expect(
//         MenuItemConsumptionService.create(mockMenuItemData)
//       ).rejects.toThrow(
//         "Error creating menu item consumption: Creation failed"
//       );
//     });
//   });

//   describe("update", () => {
//     it("should update a menu item successfully", async () => {
//       const updatedItem = { ...mockMenuItemData, itemName: "Updated Pizza" };
//       (MenuItemConsumption.findByIdAndUpdate as jest.Mock).mockResolvedValue(
//         updatedItem
//       );

//       const result = await MenuItemConsumptionService.update("12345", {
//         itemName: "Updated Pizza",
//       });

//       expect(result).toEqual(updatedItem);
//       expect(MenuItemConsumption.findByIdAndUpdate).toHaveBeenCalledWith(
//         "12345",
//         { $set: { itemName: "Updated Pizza" } },
//         { new: true, runValidators: true }
//       );
//     });

//     it("should return null if menu item not found", async () => {
//       (MenuItemConsumption.findByIdAndUpdate as jest.Mock).mockResolvedValue(
//         null
//       );

//       const result = await MenuItemConsumptionService.update("12345", {
//         itemName: "Updated Pizza",
//       });

//       expect(result).toBeNull();
//     });
//   });

//   describe("fetchAll", () => {
//     const mockFindResponse = {
//       populate: jest.fn().mockReturnThis(),
//       sort: jest.fn().mockReturnThis(),
//       skip: jest.fn().mockReturnThis(),
//       limit: jest.fn().mockReturnThis(),
//       lean: jest.fn().mockResolvedValue(mockMenuItems),
//     };

//     beforeEach(() => {
//       (MenuItemConsumption.find as jest.Mock).mockReturnValue(mockFindResponse);
//       (MenuItemConsumption.countDocuments as jest.Mock).mockResolvedValue(2);
//     });

//     it("should fetch menu items with pagination and search", async () => {
//       const result = await MenuItemConsumptionService.fetchAll({
//         search: "pizza",
//         page: 1,
//         limit: 10,
//       });

//       expect(result.items).toEqual(mockMenuItems);
//       expect(result.total).toBe(2);
//       expect(result.page).toBe(1);
//       expect(MenuItemConsumption.find).toHaveBeenCalledWith({
//         $or: [
//           { itemName: { $regex: "pizza", $options: "i" } },
//           { itemCode: { $regex: "pizza", $options: "i" } },
//           { description: { $regex: "pizza", $options: "i" } },
//         ],
//       });
//     });

//     it("should fetch menu items with category filter", async () => {
//       const result = await MenuItemConsumptionService.fetchAll({
//         itemCategory: mockItemCategory.toString(),
//       });

//       expect(result.items).toEqual(mockMenuItems);
//       expect(result.total).toBe(2);
//       expect(MenuItemConsumption.find).toHaveBeenCalledWith({
//         itemCategory: expect.any(mongoose.Types.ObjectId),
//       });
//     });

//     it("should fetch menu items with default pagination when no params provided", async () => {
//       const result = await MenuItemConsumptionService.fetchAll();

//       expect(result.items).toEqual(mockMenuItems);
//       expect(result.page).toBe(1);
//       expect(result.limit).toBe(10);
//       expect(mockFindResponse.skip).toHaveBeenCalledWith(0);
//       expect(mockFindResponse.limit).toHaveBeenCalledWith(10);
//     });
//   });

//   describe("fetchById", () => {
//     const mockFindByIdResponse = {
//       populate: jest.fn().mockReturnThis(),
//       lean: jest.fn().mockResolvedValue(mockMenuItemData),
//     };

//     it("should fetch a single menu item by id", async () => {
//       (MenuItemConsumption.findById as jest.Mock).mockReturnValue(
//         mockFindByIdResponse
//       );

//       const result = await MenuItemConsumptionService.fetchById("12345");

//       expect(result).toEqual(mockMenuItemData);
//       expect(MenuItemConsumption.findById).toHaveBeenCalledWith("12345");
//     });

//     it("should return null if menu item not found", async () => {
//       const mockNullResponse = {
//         populate: jest.fn().mockReturnThis(),
//         lean: jest.fn().mockResolvedValue(null),
//       };
//       (MenuItemConsumption.findById as jest.Mock).mockReturnValue(
//         mockNullResponse
//       );

//       const result = await MenuItemConsumptionService.fetchById("nonexistent");

//       expect(result).toBeNull();
//     });
//   });

//   describe("delete", () => {
//     it("should delete a menu item successfully", async () => {
//       (MenuItemConsumption.findByIdAndDelete as jest.Mock).mockResolvedValue(
//         mockMenuItemData
//       );

//       const result = await MenuItemConsumptionService.delete("12345");

//       expect(result).toBe(true);
//       expect(MenuItemConsumption.findByIdAndDelete).toHaveBeenCalledWith(
//         "12345"
//       );
//     });

//     it("should return false if menu item not found", async () => {
//       (MenuItemConsumption.findByIdAndDelete as jest.Mock).mockResolvedValue(
//         null
//       );

//       const result = await MenuItemConsumptionService.delete("nonexistent");

//       expect(result).toBe(false);
//     });
//   });
// });
