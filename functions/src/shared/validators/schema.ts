import { z } from 'zod';

export const enrollmentRequestSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
  email: z.string().email(),
  name: z.string().min(2)
});

export type EnrollmentRequest = z.infer<typeof enrollmentRequestSchema>;

export class Validator {
  static validateSchema<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Validation Error: ${result.error.message}`);
    }
    return result.data;
  }

  static sanitizeHtml(input: string): string {
    // Basic sanitization, in a real environment use DOMPurify or similar
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
