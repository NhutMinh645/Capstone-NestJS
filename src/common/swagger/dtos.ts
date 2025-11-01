import { ApiProperty } from '@nestjs/swagger';
export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200 }) statusCode: number;
  @ApiProperty({ example: 'Xử lý thành công!' }) message: string;
  @ApiProperty({ example: {} }) content: T;
  @ApiProperty({ example: '2025-10-28T12:34:56.000Z' }) dateTime: string;
}
