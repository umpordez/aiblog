import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

import BaseModel from './base.js';
import logger from '../../core/logger.js';

let _publisher : RedisClientType;
let _subscriber : RedisClientType;

type Handler = (str: string) => Promise<void>;
class RedisModel extends BaseModel {
    async initializeClient() : Promise<RedisClientType> {
        const redisClient : RedisClientType = createClient({
            url: process.env.REDIS_URL as string
        });

        redisClient.on('error', (err) => { logger.error(err); });
        await redisClient.connect();

        return redisClient;
    }

    async _getSubscriber(): Promise<RedisClientType> {
        if (_subscriber) { return _subscriber; }

        _subscriber = await this.initializeClient();
        return _subscriber;
    }

    async _getPublisher(): Promise<RedisClientType> {
        if (_publisher) { return _publisher; }

        _publisher = await this.initializeClient();
        return _publisher;
    }

    async publish(event: string, params: string) : Promise<void> {
        const client = await this._getPublisher();
        await client.publish(event, params)
    }

    async subscribe(event: string, handler: Handler) : Promise<void> {
        const client = await this._getSubscriber();
        await client.subscribe(event, handler);
    }
}

export default RedisModel;
