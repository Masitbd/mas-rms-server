import { Model } from 'mongoose';

export enum ECashMemoType {
  POS = 'pos',
  A4 = 'a4',
}

export interface ICashMemoType {
  cashMemoType: ECashMemoType;
}

export type CashMemoTypeModel = Model<ICashMemoType, Record<string, unknown>>;