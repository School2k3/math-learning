import { Response } from 'express';

/**
 * Send a successful response with data
 * @param res Express response object
 * @param data Data to send in the response
 * @param message Optional message
 * @param statusCode HTTP status code (default: 200)
 */
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a successful response with no data
 * @param res Express response object
 * @param message Message to send in the response
 * @param statusCode HTTP status code (default: 200)
 */
export const sendSuccessNoDataResponse = (
  res: Response,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
  });
};

/**
 * Send an error response
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 */
export const sendErrorResponse = (
  res: Response,
  message = 'Server error',
  statusCode = 500
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Send a bad request response (400)
 * @param res Express response object
 * @param message Error message
 */
export const sendBadRequestResponse = (
  res: Response,
  message = 'Bad request'
) => {
  sendErrorResponse(res, message, 400);
};

/**
 * Send an unauthorized response (401)
 * @param res Express response object
 * @param message Error message
 */
export const sendUnauthorizedResponse = (
  res: Response,
  message = 'Unauthorized'
) => {
  sendErrorResponse(res, message, 401);
};

/**
 * Send a forbidden response (403)
 * @param res Express response object
 * @param message Error message
 */
export const sendForbiddenResponse = (
  res: Response,
  message = 'Forbidden'
) => {
  sendErrorResponse(res, message, 403);
};

/**
 * Send a not found response (404)
 * @param res Express response object
 * @param message Error message
 */
export const sendNotFoundResponse = (
  res: Response,
  message = 'Not found'
) => {
  sendErrorResponse(res, message, 404);
};

/**
 * Send a validation error response (400)
 * @param res Express response object
 * @param message Error message
 * @param errors Validation errors
 */
export const sendValidationErrorResponse = (
  res: Response,
  message = 'Validation error',
  errors: any[] = []
) => {
  res.status(400).json({
    success: false,
    message,
    errors,
  });
};