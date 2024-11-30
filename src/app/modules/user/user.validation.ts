import { z } from "zod";

const createUserZodSchema = z.object({
  body: z.object({
    password: z.string().optional(),

    profile: z.object({
      name: z.string({
        required_error: "Name is required",
      }),
      fatherName: z.string({
        required_error: "Fatehr Name is required",
      }),
      motherName: z.string({
        required_error: "Mother  Name is required",
      }),
      email: z
        .string({
          required_error: "Email is required",
        })
        .email(),
      phone: z.string({
        required_error: "phone number is required",
      }),

      address: z.string({
        required_error: "Address is required",
      }),
    }),
  }),
});

export const UserValidation = {
  createUserZodSchema,
};
