import { ArgumentsHost, BadRequestException, Catch, ConflictException, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (e.code === 'P2002') {
      // unique
      throw new ConflictException('Dữ liệu trùng lặp');
    }
    if (e.code === 'P2003') {
      const field = (e.meta as any)?.field_name || (e.meta as any)?.target || 'foreign key';
      throw new BadRequestException(`Ràng buộc khóa ngoại vi phạm: ${field}`);
    }
    if (e.code === 'P2011') {
      throw new BadRequestException('Thiếu giá trị bắt buộc (kiểm tra AUTO_INCREMENT/DEFAULT).');
    }
    if (e.code === 'P2025') {
      throw new NotFoundException('Bản ghi không tồn tại');
    }
    throw new BadRequestException(`Prisma error: ${e.code}`);
  }
}
