import { BadRequestException, ValidationError } from '@nestjs/common';

/**
 * Process validation errors
 *
 * @param errors array of validation errors
 *
 * @returns BadRequestException error
 */
export default function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const errorResponse = errors.map((error) => {
    return {
      [error.property]: Object.values(error.constraints).join(','),
    };
  });

  return new BadRequestException({
    error: {
      code: 'VALIDATION_ERROR',
      message: Object.assign({}, ...errorResponse),
    },
  });
}
