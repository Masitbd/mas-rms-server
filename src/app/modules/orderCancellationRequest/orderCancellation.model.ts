import { model, Schema } from "mongoose";
import { ICancellationRequest } from "./orderCancellation.interface";
import { ENUM_CANCELLATION_STATUS } from "../../enums/EnumCalcellationStatus";

const cancellationSchema = new Schema<ICancellationRequest>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: [true, "Order ID is required"],
      index: true,
      ref: "Order",
    },
    reason: {
      type: String,
    },
    description: {
      type: String,
    },
    notifyCustomer: {
      type: Boolean,
      default: false,
    },
    refundOption: {
      type: String,

      default: "none",
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    status: {
      type: String,
      default: ENUM_CANCELLATION_STATUS.PENDING,
    },
    adminNote: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false, // Disable the __v field
  }
);

export const OrderCancellation = model("OrderCancellation", cancellationSchema);
