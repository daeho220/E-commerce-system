import { PrismaClient } from '@prisma/client';

const down = async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();

    // Redis 클라이언트 연결 종료
    if (global.redisClient) {
        await global.redisClient.quit();
    }

    // 이벤트 루프가 한 번 더 실행될 때까지 대기
    await new Promise<void>((resolve) => setImmediate(resolve));

    await global.mysql.stop();
    await global.redis.stop();
    process.exit(0);
};

export default down;
