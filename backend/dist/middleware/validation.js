import { ZodError } from 'zod';
import { sendValidationErrorResponse } from '../utils/apiResponse.js';
/**
 * Middleware for validating request data using Zod schemas
 * @param schema Zod schema to validate against
 * @param source Where to find the data to validate (body, params, query)
 */
export const validateRequest = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const data = req[source];
            await schema.parseAsync(data);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                return sendValidationErrorResponse(res, 'Validation failed', formattedErrors);
            }
            return sendValidationErrorResponse(res, 'Validation failed');
        }
    };
};
