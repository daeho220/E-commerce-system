import { Module } from '@nestjs/common';
import { PointsMockController } from './mock/point.mock.controller';

@Module({
    imports: [],
    controllers: [PointsMockController],
    providers: [],
})
export class PointModule {}
