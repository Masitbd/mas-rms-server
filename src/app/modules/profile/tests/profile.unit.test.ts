// import {
//   dbConnect,
//   dbDisconnect,
// } from "../../../../utils/test-utils/dbHandler.utils";
// import { generateUUid } from "../../user/user.utils";
// import { Profile } from "../profile.model";
// import { ProfileService } from "../profile.service";

// beforeAll(async () => {
//   // Connect to your MongoDB database
//   await dbConnect();
// });

// afterAll(async () => {
//   // Connect to your MongoDB database
//   await dbDisconnect();
// });

// describe("Testing profile functionality", () => {
//   const fakeProfileData = {
//     name: "Alice Johnson",
//     fatherName: "Robert Johnson",
//     motherName: "Linda Johnson",
//     address: "123 Maple Street, Springfield, IL, 62701",
//     email: "alice.johnson@example.com",
//     phone: "555-123-4567",
//     age: "29",
//     dateOfBirth: "1995-06-15",
//     gender: "Female",
//     uuid: " U-00001",
//   };
//   it("Should generate new uuid", async () => {
//     const newUUid = await generateUUid();
//     expect(newUUid.startsWith("U-")).toBeTruthy();
//   });
//   it("Should successfully insert data to database", async () => {
//     const result = await Profile.create(fakeProfileData);

//     expect(result.name).toBe("Alice Johnson");
//   });

//   it("should help to update profile", async () => {
//     const profile = await Profile.findOne({ uuid: fakeProfileData.uuid });
//     const result = await ProfileService.patchProfile(fakeProfileData.uuid, {
//       name: "New Name",
//     });

//     expect(result).not.toBeNull();
//     expect(result?.name).toBe("New Name");
//   });
// });
