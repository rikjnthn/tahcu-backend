import {
  BadRequestException,
  HttpStatus,
  ValidationError,
} from '@nestjs/common';

export default (errors: ValidationError[]) => {
  const errorResponse = errors.map((error) => {
    return {
      [error.property]: Object.values(error.constraints).join(','),
    };
  });

  return new BadRequestException({
    message: Object.assign({}, ...errorResponse),
    error: 'Bad Request',
    statusCode: HttpStatus.BAD_REQUEST,
  });
};
