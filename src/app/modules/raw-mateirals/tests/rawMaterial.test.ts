// /* eslint-disable @typescript-eslint/no-unused-vars */

// import app from "../../../../app";
// import {
//   dbConnect,
//   dbDisconnect,
// } from "../../../../utils/test-utils/dbHandler.utils";
// import { RawMaterialService } from "../rawMaterial.service";
// import request from "supertest";

// beforeAll(async () => {
//   // Connect to your MongoDB database
//   await dbConnect();
// });

// afterAll(async () => {
//   // Connect to your MongoDB database
//   await dbDisconnect();
// });

// // MockData
// const mockData = {
//   id: "RM007",
//   baseUnit: "GRAM",
//   materialName: "Nickel Powder",
//   superUnit: "KG",
//   rate: 60.0,
//   conversion: 1000,
//   description: "Nickel powder used in metallurgical processes.",
// };

// const mockDataForPatch = {
//   id: "RM007",
//   baseUnit: "GRAM",
//   materialName: "Nickel Powder",
//   superUnit: "KG",
//   rate: 60.0,
//   conversion: 1000,
//   description: "Nickel powder used in metallurgical processes.",
// };

// describe("Checking all the service function", () => {
//   it("Should insert a new data into the database", async () => {
//     const result = await RawMaterialService.post(mockData);
//     expect(result.id).toBe("RM007");
//   });
//   it("should throw an error for duplicate id ", async () => {
//     try {
//       await RawMaterialService.post(mockData);
//       await RawMaterialService.post(mockData);
//     } catch (error: any) {
//       expect(error.message).toBe(
//         'E11000 duplicate key error collection: test.rawmaterials index: id_1 dup key: { id: "RM007" }'
//       );
//     }
//   });
//   it("should update an existing data in the database", async () => {
//     const result = await RawMaterialService.patch(mockDataForPatch);
//     expect(result).toBeTruthy();
//     expect(result?.baseUnit).toBe("GRAM");
//   });

//   it("should Throw error when no id or mismatch id is provided", async () => {
//     mockDataForPatch.id = "878787";
//     try {
//       await RawMaterialService.patch(mockDataForPatch);
//     } catch (error: any) {
//       expect(error.message).toBe("Item does not exists");
//     }
//   });

//   it("should delete get all the items", async () => {
//     const result = await RawMaterialService.getAll();
//     expect(result).toBeTruthy();
//     expect(result.length).toBeGreaterThan(0);
//   });

//   it("should get single item by id ", async () => {
//     const result = await RawMaterialService.getById("RM007");
//     expect(result).toBeTruthy();
//     expect(result?.id).toBe("RM007");
//   });

//   it("should throw error when no item is found", async () => {
//     try {
//       await RawMaterialService.getById("878787");
//     } catch (error: any) {
//       expect(error.message).toBe("Item not found");
//     }
//   });

//   it("should should throw error when invalid id is provided", async () => {
//     try {
//       const result = await RawMaterialService.remove("RM0");
//     } catch (error: any) {
//       expect(error?.message).toBe("Item does not exists");
//     }
//   });

//   it("should delete an item by id ", async () => {
//     const result = await RawMaterialService.remove("RM007");
//     expect(result).toBeTruthy();
//   });
// });

// // Testgin all the api routes
// describe("Testing all the api routes", () => {
//   it("Should post a new Item ", async () => {
//     await request(app).post("/api/v1/raw-material").send(mockData).expect(200);
//   });
//   it("should fetch all the items", async () => {
//     const result = await request(app).get("/api/v1/raw-material").expect(200);
//     expect(result.body.data.length).toBeGreaterThan(0);
//   });
//   it("should fetch single item", async () => {
//     const result = await request(app)
//       .get("/api/v1/raw-material/RM007")
//       .expect(200);

//     expect(result.body.data.id).toBe(mockData.id);
//   });

//   it("should remove the item", async () => {
//     const res = await request(app)
//       .delete("/api/v1/raw-material/RM007")
//       .expect(200);

//     expect(res.body.message).toBe("Raw Material deleted successfully");
//   });
//   it("should update the item", async () => {
//     mockData.id = "1100";
//     mockDataForPatch.id = "1100";
//     const ud = await request(app)
//       .post("/api/v1/raw-material")
//       .send(mockData)
//       .expect(200);
//     const res = await request(app)
//       .patch("/api/v1/raw-material")
//       .send(mockDataForPatch)
//       .expect(200);

//     expect(res.body.message).toBe("Raw Material Updated successfully");
//   });
// });
