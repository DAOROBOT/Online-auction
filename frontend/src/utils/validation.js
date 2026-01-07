/**
 * Utility functions for form validation with Zod
 */

/**
 * Validate form data against a Zod schema
 * @param {ZodSchema} schema - The Zod schema to validate against
 * @param {Object} data - The form data to validate
 * @returns {Object} - { success: boolean, data?: any, errors?: Array, message?: string }
 */
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      // Get all error messages as an array
      const messages = error.errors.map(err => err.message);
      
      return {
        success: false,
        errors: error.errors, // Raw Zod errors
        messages: messages, // Array of error messages
        message: messages.join('\n'), // Each error on new line
      };
    }

    return {
      success: false,
      message: error.message || 'Validation failed',
    };
  }
};

/**
 * Validate a single field
 * @param {ZodSchema} schema - The Zod schema
 * @param {string} fieldName - The field name to validate
 * @param {any} value - The field value
 * @returns {Object} - { success: boolean, error?: string }
 */
export const validateField = (schema, fieldName, value) => {
  try {
    // Create a partial object with just this field
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) {
      return { success: true };
    }
    
    fieldSchema.parse(value);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Invalid value',
    };
  }
};

/**
 * Get first error message from validation result
 * @param {Object} errors - Errors object from validateForm
 * @returns {string} - First error message
 */
export const getFirstError = (errors) => {
  if (!errors) return '';
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey] || '';
};

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return errors && Object.keys(errors).length > 0;
};
