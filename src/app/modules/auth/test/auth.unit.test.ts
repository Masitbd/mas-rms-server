// import {
//   dbConnect,
//   dbDisconnect,
// } from "../../../../utils/test-utils/dbHandler.utils";
// import { Profile } from "../../profile/profile.model";
// import { UserService } from "../../user/user.service";
// import { AuthService } from "../auth.service";

// beforeAll(async () => {
//   // Connect to your MongoDB database
//   await dbConnect();
// });
// afterAll(async () => {
//   // Connect to your MongoDB database
//   await dbDisconnect();
// });

// describe("Checking auth function", () => {
//   const fakeUserData = {
//     uuid: "U-00001",
//     role: "Admin",
//     password: "password123!",
//     needsPasswordChange: true,
//     status: "active",
//     email: "alice.johnson@example.com",
//   };
//   const fakeProfileData = {
//     name: "Alice Johnson",
//     fatherName: "Robert Johnson",
//     motherName: "Linda Johnson",
//     address: "123 Maple Street, Springfield, IL, 62701",
//     email: "alice.johnson@example.com",
//     phone: "555-123-4567",
//     age: "29",
//     dateOfBirth: new Date(),
//     gender: "Female",
//     uuid: "U-00001",
//   };

//   it("should act as logging in  and return logged in data", async () => {
//     try {
//       await Profile.createCollection();
//       // const result = await UserService.createUser(
//       //   fakeProfileData,
//       //   fakeUserData
//       // );

//       const login = await AuthService.loginUser({
//         email: "alice.johnson@example.com",
//         password: "password123!",
//       });

//       expect(login.accessToken).toBeTruthy();
//     } catch (error) {
//       console.error(error);
//     }
//   });

//   it("should request for a accress token and retrive it", async () => {
//     const login = await AuthService.loginUser({
//       email: "alice.johnson@example.com",
//       password: "password123!",
//     });

//     const refreashToken = await AuthService.refreshToken(
//       login?.refreshToken as string
//     );
//     expect(refreashToken.accessToken).toBeTruthy();
//   });
// });
