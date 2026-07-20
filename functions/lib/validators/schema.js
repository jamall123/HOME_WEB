import { z } from 'zod';
export const enrollmentRequestSchema = z.object({
    userId: z.string().min(1),
    courseId: z.string().min(1),
    status: z.enum(['pending', 'approved', 'rejected']),
    email: z.string().email(),
    name: z.string().min(2)
});
export class Validator {
    static validateSchema(schema, data) {
        const result = schema.safeParse(data);
        if (!result.success) {
            throw new Error(`Validation Error: ${result.error.message}`);
        }
        return result.data;
    }
    static sanitizeHtml(input) {
        // Basic sanitization, in a real environment use DOMPurify or similar
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
//# sourceMappingURL=schema.js.map