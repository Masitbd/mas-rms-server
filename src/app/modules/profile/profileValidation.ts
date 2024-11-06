import { z } from 'zod';

const postValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    fatherName: z.string({ required_error: 'Father Name is required' }),
    motherName: z.string({ required_error: 'Mother Name is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    email: z.string({ required_error: 'Email is required' }),
    address: z.string({ required_error: 'Address is required' }),
    age: z.string({ required_error: 'Age is required' }),
    dateOfBirth: z.string({ required_error: 'Date of Birth is required' }),
    gender: z.string({ required_error: 'Gender is required' }),
  }),
});

const patchVlaidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).optional(),
    fatherName: z
      .string({ required_error: 'Father Name is required' })
      .optional(),
    motherName: z
      .string({ required_error: 'Mother Name is required' })
      .optional(),
    phone: z.string({ required_error: 'Phone is required' }).optional(),
    email: z.string({ required_error: 'Email is required' }).optional(),
    address: z.string({ required_error: 'Address is required' }).optional(),
    age: z.string({ required_error: 'Age is required' }).optional(),
    dateOfBirth: z
      .string({ required_error: 'Date of Birth is required' })
      .optional(),
    gender: z.string({ required_error: 'Gender is required' }).optional(),
  }),
});

export const ProfileValidator = {
  postValidation,
  patchVlaidation,
};
