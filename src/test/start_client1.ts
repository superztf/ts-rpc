import { IClientOptions, CLIENTHANDLE_EVENT } from '../utils/interface';
import { getLogger } from 'log4js';
import { MyMethod1, MyMethod3, prints } from './base_client';
import { createClient } from '../client';

const logger = getLogger();
logger.level = 'debug';

class MyAPP {
    public rpcObj = new MyMethod1();
    public rpcObj2 = new MyMethod3();
}

const app = new MyAPP();

function test() {
    const OPTS: IClientOptions = {
        connect: {
            host: 'localhost',
            port: 25165,
        },
        logger,
        service: 'myapp-1',
        token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
    };
    const obj = createClient(OPTS, app, () => {
        logger.info('createClient Over');
    });
    obj.on(CLIENTHANDLE_EVENT.OTHER_CLOSE, (key: string) => { prints(key, 'other app CLOSE...'); });
    obj.on(CLIENTHANDLE_EVENT.OTHER_RIGISTED, (key: string) => { prints(key, 'other app RIGISTED...'); });
    obj.on(CLIENTHANDLE_EVENT.REGISTED, (key: string, others: string[]) => { prints(key, others, 'my app RIGISTED...'); });
    obj.on(CLIENTHANDLE_EVENT.CLOSE, () => { prints('my app close...'); });
}

test();
