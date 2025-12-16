/**
 * Validation middleware
 * Validates request body, params, and query against schemas
 */

import { ApiError } from './error.js';

/**
 * Validate request data against a schema
 * Supports Joi, Zod, or custom validation functions
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Combine body, params, and query for validation
    const dataToValidate = {
      body: req.body,
      params: req.params,
      query: req.query
    };

    // Handle Joi schema
    if (schema.validate) {
      const { error, value } = schema.validate(dataToValidate);
      if (error) {
        const messages = error.details.map(detail => detail.message).join(', ');
        return next(new ApiError(400, messages));
      }
      // Replace with validated values
      req.body = value.body || req.body;
      req.params = value.params || req.params;
      req.query = value.query || req.query;
      return next();
    }

    // Handle Zod schema
    if (schema.parse) {
      try {
        const validated = schema.parse(dataToValidate);
        req.body = validated.body || req.body;
        req.params = validated.params || req.params;
        req.query = validated.query || req.query;
        return next();
      } catch (error) {
        const messages = error.errors.map(err => err.message).join(', ');
        return next(new ApiError(400, messages));
      }
    }

    // Handle custom validation function
    if (typeof schema === 'function') {
      const error = schema(dataToValidate);
      if (error) {
        return next(new ApiError(400, error));
      }
      return next();
    }

    next();
  };
};

/**
 * Validate request body
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    // Handle Joi schema
    if (schema.validate) {
      const { error, value } = schema.validate(req.body);
      if (error) {
        const messages = error.details.map(detail => detail.message).join(', ');
        return next(new ApiError(400, messages));
      }
      req.body = value;
      return next();
    }

    // Handle Zod schema
    if (schema.parse) {
      try {
        req.body = schema.parse(req.body);
        return next();
      } catch (error) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(400, messages));
      }
    }

    // Handle custom validation function
    if (typeof schema === 'function') {
      const error = schema(req.body);
      if (error) {
        return next(new ApiError(400, error));
      }
      return next();
    }

    next();
  };
};

/**
 * Validate request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    // Handle Joi schema
    if (schema.validate) {
      const { error, value } = schema.validate(req.params);
      if (error) {
        const messages = error.details.map(detail => detail.message).join(', ');
        return next(new ApiError(400, messages));
      }
      req.params = value;
      return next();
    }

    // Handle Zod schema
    if (schema.parse) {
      try {
        req.params = schema.parse(req.params);
        return next();
      } catch (error) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(400, messages));
      }
    }

    // Handle custom validation function
    if (typeof schema === 'function') {
      const error = schema(req.params);
      if (error) {
        return next(new ApiError(400, error));
      }
      return next();
    }

    next();
  };
};

/**
 * Validate request query
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Handle Joi schema
    if (schema.validate) {
      const { error, value } = schema.validate(req.query);
      if (error) {
        const messages = error.details.map(detail => detail.message).join(', ');
        return next(new ApiError(400, messages));
      }
      req.query = value;
      return next();
    }

    // Handle Zod schema
    if (schema.parse) {
      try {
        req.query = schema.parse(req.query);
        return next();
      } catch (error) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(400, messages));
      }
    }

    // Handle custom validation function
    if (typeof schema === 'function') {
      const error = schema(req.query);
      if (error) {
        return next(new ApiError(400, error));
      }
      return next();
    }

    next();
  };
};

/**
 * Sanitize request data - removes unwanted fields
 */
const sanitize = (allowedFields) => {
  return (req, res, next) => {
    const sanitized = {};
    allowedFields.forEach(field => {
      if (field in req.body) {
        sanitized[field] = req.body[field];
      }
    });
    req.body = sanitized;
    next();
  };
};

/**
 * Trim whitespace from string fields
 */
const trimStrings = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};

export { validate, validateBody, validateParams, validateQuery, sanitize, trimStrings };
