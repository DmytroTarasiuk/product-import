import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express/multer';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING),
    MulterModule.register(),
    ScheduleModule.forRoot(),
    ProductsModule,
  ],
})
export class AppModule {}
