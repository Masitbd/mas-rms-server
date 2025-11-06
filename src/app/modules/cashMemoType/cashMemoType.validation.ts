import { z } from 'zod';
import { ECashMemoType } from './cashMemoType.interface';

const createCashMemoTypeValidationSchema = z.object({
  body: z.object({
    cashMemoType: z.enum([ECashMemoType.POS, ECashMemoType.A4]),
  }),
});

const updateCashMemoTypeValidationSchema = z.object({
  body: z.object({
    cashMemoType: z.enum([ECashMemoType.POS, ECashMemoType.A4]).optional(),
  }),
});


export const CashMemoTypeValidation = {
  createCashMemoTypeValidationSchema,
  updateCashMemoTypeValidationSchema
};
