import { model, Schema } from "mongoose";
import { TDeliveryAddress } from "./deliveryAddresses.interface";

const deliveryAddressSchema = new Schema<TDeliveryAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  landMark: { type: String },
  division: { type: String, required: true },
  city: { type: String, required: true },
  zone: { type: String, required: true },
  address: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  isDefault: { type: Schema.Types.Boolean, default: false },
});

export const DeliveryAddress = model("DeliveryAddress", deliveryAddressSchema);
