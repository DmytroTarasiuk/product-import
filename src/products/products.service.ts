import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { uuid } from 'uuidv4';
import { Product, ProductDocument } from './schemas/product.schema';
import * as csvtojson from 'csvtojson';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async importProducts(csvBuffer: Buffer, deleteFlag: boolean): Promise<void> {
    const jsonArray = await csvtojson().fromString(csvBuffer.toString());

    const batchSize = 1000;
    this.logger.log(`Total records to process: ${jsonArray.length}`);

    try {
      for (let i = 0; i < jsonArray.length; i += batchSize) {
        const batch = jsonArray.slice(i, i + batchSize);

        this.logger.log(
          `Processing batch ${i / batchSize + 1}/${Math.ceil(
            jsonArray.length / batchSize,
          )}`,
        );

        const productsToSave = batch.map((item) => {
          return {
            docId: uuid(),
            data: {
              description: item.ProductDescription,
              name: item.ProductName,
              vendorId: item.ItemID,
              manufacturerId: item.ManufacturerID,
              variants: [
                {
                  description: item.ItemDescription,
                  packaging: item.PKG,
                },
              ],
              options: [
                {
                  id: uuid(),
                  name: 'packaging',
                  values: [
                    {
                      id: uuid(),
                      name: item.PKG,
                      value: item.PKG,
                    },
                  ],
                },
                {
                  id: uuid(),
                  name: 'description',
                  values: [
                    {
                      id: uuid(),
                      name: item.ItemDescription,
                      value: item.ItemDescription,
                    },
                  ],
                },
              ],
            },
          };
        });

        if (deleteFlag) {
          await this.productModel.deleteMany({});
        }
        await this.productModel.insertMany(productsToSave);

        this.logger.log(`Batch ${i / batchSize + 1} processed successfully.`);
      }

      this.logger.log('Data import completed.');

      await this.enhanceDescriptions();

      this.logger.log('Description enhancement completed.');
    } catch (error) {
      this.logger.error(`Error during batch processing: ${error.message}`);
    }
    await this.enhanceDescriptions();
  }

  private async enhanceDescriptions(): Promise<void> {
    const products = await this.productModel.find().limit(10);

    for (const product of products) {
      const enhancedDescription = await this.callGpt4(product.data.name);

      await this.productModel.findByIdAndUpdate(product._id, {
        data: {
          ...product.data,
          description: enhancedDescription,
        },
      });
    }
  }

  private async callGpt4(name: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Please compose a description for this product ${name}`,
        },
      ],
      model: 'gpt-3.5-turbo',
    });

    return `${completion.choices[0].message.content}`;
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async scheduledImportAndEnhancement(csvBuffer: Buffer, deleteFlag: boolean) {
    try {
      this.logger.log('Scheduled task started: Import and Enhance Products');

      await this.importProducts(csvBuffer, deleteFlag);

      this.logger.log('Scheduled task completed: Import and Enhance Products');
    } catch (error) {
      this.logger.error(`Error during scheduled task: ${error.message}`);
    }
  }
}
