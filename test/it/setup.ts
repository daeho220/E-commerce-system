import * as fs from 'fs';
import { MySqlContainer } from '@testcontainers/mysql';
import { PrismaClient } from '@prisma/client';
import { GenericContainer } from 'testcontainers';
import { Redis } from 'ioredis';

let prisma: PrismaClient;

const init = async () => {
    await Promise.all([initMysql(), initRedis()]);
    // await Promise.all([initMysql()]);
};

const initMysql = async () => {
    const mysql = await new MySqlContainer('mysql:8')
        .withDatabase('ecommerce')
        .withUser('root')
        .withRootPassword('root')
        .start();

    global.mysql = mysql;

    process.env.DATABASE_URL = `mysql://root:root@${mysql.getHost()}:${mysql.getPort()}/${mysql.getDatabase()}/connection_limit=5`;

    prisma = new PrismaClient();
    await prisma.$connect();
    await runMigrations();
    await insertTestData(prisma);
};

const initRedis = async () => {
    const redisContainer = await new GenericContainer('redis').withExposedPorts(6379).start();

    global.redis = redisContainer;

    process.env.REDIS_HOST = redisContainer.getHost();
    process.env.REDIS_PORT = redisContainer.getMappedPort(6379).toString();

    global.redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
    });
};

const runMigrations = async () => {
    try {
        const initTableSql = fs.readFileSync('./test/it/table.init.sql').toString();
        for (const sql of initTableSql.split(';').filter((s) => s.trim() !== '')) {
            await prisma.$executeRawUnsafe(sql);
        }
    } catch (error) {
        throw error;
    }
};

const insertTestData = async (prisma: PrismaClient) => {
    const importSql = fs.readFileSync('./test/it/import.sql').toString();
    for (const sql of importSql.split(';').filter((s) => s.trim() !== '')) {
        await prisma.$executeRawUnsafe(sql);
    }
};

export default init;
