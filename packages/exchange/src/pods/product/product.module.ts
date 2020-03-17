import { Module } from '@nestjs/common';
import { DeviceModule } from '@energyweb/origin-backend';
import { ProductService } from './product.service';

@Module({
    imports: [DeviceModule.register(null)],
    providers: [ProductService],
    exports: [ProductService]
})
export class ProductModule {}
