import { simplerpc, promirpc, createClientSync } from '../client/index';
import { IClientOptions } from '../utils/interface';
import { getLogger } from 'log4js';
import { MyMethod3, MyMethod1, prints } from './base_client';

const logger = getLogger();
logger.level = 'debug';

const OPTS: IClientOptions = {
    service: 'myapp-2',
    connect: {
        host: 'localhost',
        port: 25165,
    },
    logger,
    token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
};

class MyAPP {
    public rpcProxy: MyMethod1 | undefined;
    public rpcProxy2: MyMethod3 | undefined;
}

const app = new MyAPP();

async function test() {
    const rpcclient = await createClientSync(OPTS, app);
    const other = 'myapp-1';
    app.rpcProxy = rpcclient.ProxyRoute('rpcObj') as MyMethod1;
    app.rpcProxy2 = rpcclient.ProxyRoute('rpcObj2') as MyMethod3;
    rpcclient.SetCallFuncOpts({ service: other, timeout: 2000 });
    simplerpc(app.rpcProxy.m1foo2)();
    simplerpc(app.rpcProxy.m1foo1)(23333, { msg1: 'lalala', msg2: 'ok' });
    simplerpc({ service: other, timeout: 50 }, app.rpcProxy.method2.m2foo1)('hello world');

    const result: string = await promirpc({ service: other }, app.rpcProxy.method3.m3foo1)(33);
    prints('promirpc back result:', result);

    simplerpc({ service: other }, app.rpcProxy2.m3foo1)(500, (err: any, backkey: string) => {
        prints('simplerpc back result', err, backkey);
    });

    simplerpc({ service: [other] }, app.rpcProxy.m1foo1)(666, { name: ['ztf', 'love'] });
}

test();
