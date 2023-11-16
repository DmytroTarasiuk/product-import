import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import * as multer from 'multer';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import * as csvtojson from 'csvtojson';

const storage = multer.memoryStorage();
const upload = multer({ storage });

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: storage }))
  async uploadFile(@UploadedFile() file) {
    // Convert CSV buffer to JSON
    console.log(file);
    const jsonArray = await csvtojson().fromString(file.buffer.toString());
    console.log(jsonArray);

    // Convert JSON array to an array of ProductDto objects
    const productDtoArray: ProductDto[] = jsonArray.map((item) => ({
      name: item.Name,
      //price: item.Description,
      // Map other properties accordingly
    }));

    // Save products to MongoDB
    const savedProducts = await Promise.all(
      productDtoArray.map((productDto) => this.productsService.create(productDto)),
    );

    return { message: 'File uploaded successfully', data: savedProducts };
  }
}