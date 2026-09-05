import { jest } from '@jest/globals';
import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  let mockJson: jest.Mock<(body: any) => void>;
  let mockResponse: {
    status: jest.Mock<(code: number) => { json: typeof mockJson }>;
  };

  const createMockHost = () =>
    ({
      switchToHttp: () => ({ getResponse: () => mockResponse }),
    }) as any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockResponse = {
      status: jest
        .fn<(code: number) => any>()
        .mockReturnValue({ json: mockJson }),
    };
    filter = new HttpExceptionFilter();
  });

  it('should handle HttpException with a string message', () => {
    const exception = new HttpException('Something broke', 500);

    filter.catch(exception, createMockHost());

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      message: 'Something broke',
    });
  });

  it('should handle NotFoundException', () => {
    const exception = new NotFoundException('Resource not found');

    filter.catch(exception, createMockHost());

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
    });
  });

  it('should handle HttpException with object response containing a string message', () => {
    const exception = new HttpException({ message: 'Validation failed' }, 422);

    filter.catch(exception, createMockHost());

    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
    });
  });

  it('should join array messages from HttpException', () => {
    const exception = new BadRequestException([
      'email must be valid',
      'password is required',
    ]);

    filter.catch(exception, createMockHost());

    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'email must be valid, password is required',
    });
  });

  it('should handle non-HttpException errors as 500', () => {
    filter.catch(new Error('random crash'), createMockHost());

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });

  it('should handle unknown exception types as 500', () => {
    filter.catch('string error', createMockHost());

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
