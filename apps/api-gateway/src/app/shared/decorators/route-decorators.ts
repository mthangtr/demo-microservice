import { applyDecorators, All } from '@nestjs/common';

/**
 * Decorator để đánh dấu một endpoint proxy xử lý tất cả các HTTP methods.
 * @param path Path pattern (mặc định là '/*')
 * @returns Decorator
 */
export function ProxyRoute(path: string = '/*') {
  return applyDecorators(
    All(path)
  );
}
