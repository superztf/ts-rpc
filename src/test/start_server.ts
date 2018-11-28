import { getLogger } from 'log4js';
const logger = getLogger();
logger.level = 'debug';
import { IServerOptions } from '../utils/interface';
import { createProxy } from '../server/index';

const opts: IServerOptions = {
    listen: {
        host: 'localhost',
        port: 25165,
    },
    logger,
    token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
};

createProxy(opts);
