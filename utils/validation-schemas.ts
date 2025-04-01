import { z } from "zod";

export const documentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  cid: z
    .string()
    .min(1, "CID is required")
    // .length(11, "CID must be exactly 11 digits")
    .regex(/^\d+$/, "CID must contain only numbers"),
  file: z.instanceof(File, { message: "Please upload a document" }),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;

// This function returns validation errors for a specific field
export const getFieldError = (
  errors: z.ZodError | null | undefined,
  field: keyof DocumentFormData
): string | null => {
  if (!errors) return null;

  const fieldErrors = errors.flatten().fieldErrors;
  return fieldErrors[field]?.[0] || null;
};

// This function validates all fields and returns a ZodError if validation fails
export const validateForm = (data: {
  name: string;
  email: string;
  cid: string;
  file: File | null;
}): { success: boolean; error: z.ZodError | null } => {
  try {
    documentFormSchema.parse(data);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }

    // This shouldn't happen with Zod, but just in case
    console.error("Unexpected validation error:", error);
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          path: ["form"],
          message: "An unexpected error occurred",
        },
      ]),
    };
  }
};
