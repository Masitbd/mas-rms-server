import {
  dbConnect,
  dbDisconnect,
} from "../../../../utils/test-utils/dbHandler.utils";
import config from "../../../config";
import { User } from "../user.model";
import bcrypt from "bcrypt";
import { UserService } from "../user.service";
import exp from "constants";
import { IUser, IUserResponse } from "../user.interface";
import { ENUM_USER_STATUS } from "../../../enums/userStatus.enum";

beforeAll(async () => {
  await dbConnect();
});

afterAll(async () => {
  // Connect to your MongoDB database
  await dbDisconnect();
});
describe("Testing user creation functionality", () => {
  const fakeUserData = {
    uuid: "U-00001",
    role: "Admin",
    password: "password123!",
    needsPasswordChange: true,
    email: "alice.johnson@example.com",
    phone: "555-123-4567",
    status: "active",
  };
  const fakeProfileData = {
    name: "Alice Johnson",
    fatherName: "Robert Johnson",
    motherName: "Linda Johnson",
    address: "123 Maple Street, Springfield, IL, 62701",
    email: "alice.johnson@example.com",
    phone: "555-123-4567",
    age: "29",
    dateOfBirth: new Date(),
    gender: "Female",
    uuid: "U-00001",
  };
  it("should successfully create a user ", async () => {
    const result = await User.create(fakeUserData);
    const encryptedPassword = await bcrypt.compare(
      fakeUserData.password,
      result.password
    );
    expect(result.uuid).toBe("U-00001");
    expect(result.role).toBe("Admin");
    expect(encryptedPassword).toBeTruthy();
    expect(result.needsPasswordChange).toBeTruthy();
    expect(result.status).toBe("active");
  });

  it("should throw error if role is invalid", async () => {
    const invalidData = { ...fakeUserData, status: "none", uuid: "78787" };

    try {
      const result = await User.create(invalidData);
      console.log(result);
    } catch (error: any) {
      expect(error.message).toBe(
        "User validation failed: status: `none` is not a valid enum value for path `status`."
      );
    }
  });

  it("should return a single user by uuid", async () => {
    try {
      const result = await User.findOne({ uuid: fakeUserData.uuid });

      expect(result).not.toBeNull();
      expect(result?.uuid).toBe("U-00001");
      expect(result?.role).toBe("Admin");
      expect(result?.needsPasswordChange).toBeTruthy();
      expect(result?.status).toBe("active");
    } catch (error) {
      console.error(error);
    }
  });

  //   running all the function test
  it("should run and insert user via service", async () => {
    const result = await UserService.createUser(fakeProfileData, fakeUserData);
    const users = await User.find({ uuid: "U-00002" });
    expect(users.length).toEqual(1);
  });

  it("should return  a single user form service function", async () => {
    const result: IUserResponse = await UserService.getSIngleUser({
      uuid: "U-00002",
    });
    expect(result).not.toBeNull();
    expect(result?.uuid).toBe("U-00002");
  });

  it("should return all the users", async () => {
    const result = await UserService.getALluser();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should update the user status", async () => {
    const result = await UserService.patchUser("U-00002", {
      status: ENUM_USER_STATUS.RUSTICATED,
    });

    expect(result).not.toBeNull();
    expect(result?.status).toBe(ENUM_USER_STATUS.RUSTICATED);
  });
});
