import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(
    @UploadedFile() file,
    @Body('deleteFlag') deleteFlag?: boolean,
  ) {
    const csvBuffer = file.buffer;
    await this.productsService.scheduledImportAndEnhancement(
      csvBuffer,
      deleteFlag,
    );

    return { message: 'Import and enhancement process completed successfully' };
  }
}
