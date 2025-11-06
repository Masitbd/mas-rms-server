import { Schema, model } from 'mongoose';
import { CashMemoTypeModel, ICashMemoType } from './cashMemoType.interface';

const cashMemoTypeSchema = new Schema<ICashMemoType, CashMemoTypeModel>(
  {
    cashMemoType: {
      type: String,
      enum: ['pos', 'a4'],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const CashMemoType = model<ICashMemoType, CashMemoTypeModel>(
  'CashMemoType',
  cashMemoTypeSchema,
);
