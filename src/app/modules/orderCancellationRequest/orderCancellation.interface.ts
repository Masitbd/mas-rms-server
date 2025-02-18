/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { ENUM_CANCELLATION_STATUS } from "../../enums/EnumCalcellationStatus";

export type ICancellationRequest = {
  /**
   * ID of the order to be cancelled
   */
  orderId: Types.ObjectId;

  /**
   * Reason for cancellation (optional)
   */
  reason?: string;
  description?: string;

  /**
   * Flag to indicate if customer should be notified
   */
  notifyCustomer?: boolean;

  /**
   * Refund preference for the cancellation
   */
  refundOption?: string;

  /**
   * Specific items to cancel (for partial cancellations)
   */

  /**
   * Additional metadata or notes
   */
  metadata?: Record<string, any>;
  postedBy: Types.ObjectId;
  status: ENUM_CANCELLATION_STATUS;
  approvedBy?: Types.ObjectId;
  branch: Types.ObjectId;
  adminNote?: string;
};
