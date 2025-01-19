import { Schema, model } from "mongoose";
import { IProfile } from "./profile.interface";

const profileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    address: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    uuid: { type: String, required: true, unique: true },
    age: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Profile = model("Profile", profileSchema);
