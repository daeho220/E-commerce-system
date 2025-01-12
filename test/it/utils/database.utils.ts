import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

export class DatabaseUtils {
    static async resetDatabase(prisma: PrismaClient) {
        // 모든 테이블 초기화
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

        const tables = [
            'user',
            'point_history',
            'product',
            'product_sales_stat',
            'cart_items',
            'order',
            'order_detail',
            'coupon',
            'user_coupon',
            'payment',
        ];

        for (const table of tables) {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
        }

        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

        // 초기 데이터 다시 삽입
        const importSql = fs.readFileSync('./test/it/import.sql').toString();
        for (const sql of importSql.split(';').filter((s) => s.trim() !== '')) {
            await prisma.$executeRawUnsafe(sql);
        }
    }
}
