import { Schema, model } from "mongoose";
import { IProfile } from "./profile.interface";

const profileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    age: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Profile = model("Profile", profileSchema);
