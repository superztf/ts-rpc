
[![Build Status](https://travis-ci.org/superztf/ts-rpc.svg?branch=master)](https://travis-ci.org/superztf/ts-rpc)
[![npm](https://img.shields.io/npm/v/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![npm](https://img.shields.io/npm/dt/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![NpmLicense](https://img.shields.io/npm/l/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![Coverage Status](https://coveralls.io/repos/github/superztf/ts-rpc/badge.svg?branch=master)](https://coveralls.io/github/superztf/ts-rpc?branch=master)


# ts-rpc

* npm i ts-rpc-node
* [source code](https://github.com/superztf/ts-rpc)
* See bin/test for javascript example

## How it works?
Your all services connnect to a proxy server. The proxy server is responsible for forwarding data packets.
If the proxy server is not connected, the client will continue to try again and again.

## typescript example
```typescript
// server.ts
// Create proxy server.
import { IServerOptions, createProxy, ServerHandle } from "ts-rpc-node";

const opts: IServerOptions = {
    listen: {
        host: 'localhost',
        port: 25165,
    },
    token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
};

const proxyserver: ServerHandle = createProxy(opts);
```

```typescript
// client1.ts
import * as rpc from 'ts-rpc-node';

class Calculate {
    public Addition(a: number, b: number, next: (err: any, ret: number) => void) {
        if (typeof a !== 'number') {
            return next('a should be number type', 0);
        }
        if (typeof b !== 'number') {
            return next('b should be number type', 0);
        }
        next(null, a + b);
    }

    public RectangleArea(data: { height: number, width: number }, next?: (err: any, ret: number) => void) {
        if (typeof data.height !== 'number' || typeof data.width !== 'number') {
            if (next) {
                next('data err', 0);
            }
            return 0;
        }
        const area = data.height * data.width;
        if (next) {
            next(null, area);
        }
        return area;
    }
}

export class MyApp {
    public calcu = new Calculate();

    public sayHello(msg: string) {
        console.log('hello,', msg);
    }
}
const app = new MyApp();

function test() {
    const OPTS: rpc.IClientOptions = {
        connect: {
            host: 'localhost',
            port: 25165,
        },
        service: 'myapp-1',
        token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
    };
    const client: rpc.ClientHandle = rpc.createClient(OPTS, app, () => {
        console.log('registe success');
    });
    // if client has no 'on',you should npm install @types/node --save-dev
    client.on(rpc.CLIENTHANDLE_EVENT.OTHER_RIGISTED, (name: string) => {
        console.log('I find another app registed', name);
    });
}

test();
```
```typescript
// client2.ts
import { IClientOptions, createClientSync, ClientHandle, simplerpc, promirpc } from "ts-rpc-node";
import { MyApp as Clinet1APP } from './client1';

const OPTS: IClientOptions = {
    service: 'myapp-2',
    connect: {
        host: 'localhost',
        port: 25165,
    },
    token: 'JZYKMUsG2I4t6TulbpXigKHCI2E2cC6YE84H0Los2XWL/wap+Db0xv5K/aolcQIL',
};

class MyAPP2 {
    public rpc: Clinet1APP;
    constructor(client: ClientHandle) {
        this.rpc = client.ProxyRoute();
    }
}

async function test() {
    const client = await createClientSync(OPTS);
    const app = new MyAPP2(client);
    // example for 'notice'
    simplerpc({ service: 'myapp-1' }, app.rpc.sayHello)('Peach');
    client.SetCallFuncOpts({ service: 'myapp-1' }); // set the default target service
    simplerpc(app.rpc.sayHello)('Guava');

    // example for 'request'
    simplerpc(app.rpc.calcu.Addition)(3, 3, (err: any, ret: number) => {
        console.log('Addition result', ret);
    });
    const area: number = await promirpc(app.rpc.calcu.RectangleArea)({ height: 50, width: 30 });
    console.log('Rectangle Area1 is', area);
    simplerpc({ service: 'myapp-1', timeout: 50 }, app.rpc.calcu.RectangleArea)({ height: 20, width: 40 }, (err: any, ret: number) => {
        console.log('Rectangle Area2 is', ret)
    });
}

test();
```

## simplerpc()
Wrapper of RPC function

Possible signatures:
* <code>simplerpc(rpcFunc)</code>
* <code>simplerpc(options,rpcFunc)</code>

### simplerpc(rpcFunc)
Parameters:
* <code>rpcFunc</code> &laquo;Function&raquo;

Returns:
* &laquo;Function&raquo;


## simplerpc(options,rpcFunc)
### Parameters:
* <code>options</code> <a href="#link:ICallFuncOption">&laquo;ICallFuncOption&raquo;</a>
* <code>rpcFunc</code> &laquo;Function&raquo;

### Returns:
* &laquo;Function&raquo;

## promirpc()
Wrapper of RPC function, return by promise.

Possible signatures:
* <code>promirpc(rpcFunc)</code>
* <code>promirpc(options,rpcFunc)</code>

### promirpc(rpcFunc)
Parameters:
* <code>rpcFunc</code> &laquo;Function&raquo;

Returns:
* &laquo;Promise\<T\>&raquo; T is rpcFunc's return type.

### promirpc(rpcFunc)
Parameters:
* <code>options</code> <a href="#link:ICallFuncOption">&laquo;ICallFuncOption&raquo;</a>
* <code>rpcFunc</code> &laquo;Function&raquo;

Returns:
* &laquo;Promise\<T\>&raquo; T is rpcFunc's return type.

## Class:<a id="link:ClientHandle">ClientHandle</a>
### Event:CLIENTHANDLE_EVENT.REGISTED
* <code>key</code> &laquo;string&raquo; My service's name.
* <code>others</code> &laquo;string[]&raquo;Name Array of other services.

Emitted when the client successfully registe in proxy server.
### Event:CLIENTHANDLE_EVENT.CLOSE
* <code>error</code> &laquo;any&raquo;

Emitted when the connection between client and proxy server is disconnected.
### Event:CLIENTHANDLE_EVENT.OTHER_RIGISTED
* <code>key</code> &laquo;string&raquo; Other service's name.

Emitted when other service successfully registe in proxy server.
### Event:CLIENTHANDLE_EVENT.OTHER_CLOSE
* <code>key</code> &laquo;string&raquo; Other service's name.

Emitted when the connection between a service and proxy server is disconnected.
### client.SetEnv
* <code>app</code> &laquo;any&raquo; the context

Set the context for other app's rpc
### client.Remove
Disconnect from proxy server and release all references.
### client.ProxyRoute
* <code>[attr]</code> &laquo;string&raquo;

Proxy attribute.
```typescript
// client1.ts
app.rpc=client.ProxyRoute('recv') as TestA;
simplerpc({service:'client2'},app.rpc.print)('everybody');
```
```typescript
// client2.ts
class TestA{
    print(msg){
        console.log('hello',msg);
    }
}
app.recv=new TestA();
```
### client.SetCallFuncOpts
* <code>opts</code> &laquo;<a href="#link:ICallFuncOption">ICallFuncOption</a>|undefined&raquo;

simplerpc or promirpc will use this opts if you do not give a ICallFuncOption. client.SetCallFuncOpts(undefined) will clear opts you set before.
### client.setEncodeDecode
* <code>encode</code> &laquo;Function&raquo;
* <code>decode</code> &laquo;Function&raquo;

The default encode:JSON.stringify,decode:JSON.parse. Call this method to set your own encode,decode for rpc's arguments.

## createClient
Parameters:
* <code>opts</code> <a href="#link:IClientOptions">&laquo;IClientOptions&raquo;</a>
* <code>[app]</code> &laquo;any&raquo;
* <code>[cb]</code> &laquo;Function&raquo;

Returns:
* <a href="#link:ClientHandle">&laquo;ClientHandle&raquo;</a>

## createClientSync
Parameters:
* <code>opts</code> <a href="#link:IClientOptions">&laquo;IClientOptions&raquo;</a>
* <code>[app]</code> &laquo;any&raquo;

Returns:
* &laquo;Promise<<a href="#link:ClientHandle">ClientHandle</a>>&raquo;

## Class:<a id="link:ServerHandle">ServerHandle</a>
Properties:
* <code>tokencheck</code> &laquo;boolean&raquo;Open tokencheck by setting true, close by false. True is Default.If it's false, checking will not effect either client sends token or not.
* <code>newtoken</code> &laquo;string&raquo;You can Update token string. It will be priority before <a href="#link:IServerOptions">IServerOptions</a>.token.

### server.Remove
Close proxy server and release all references.

## createProxy
Parameters:
* <code>opts</code> <a href="#link:IServerOptions">&laquo;IServerOptions&raquo;</a>

Returns:
* <a id="#link:ServerHandle">&laquo;ServerHandle&raquo;</a>
## interface
### <a id="link:ICallFuncOption">ICallFuncOption</a>
* <code>service</code> &laquo;string|string[]&raquo; The target service's name.This name is the unique identifier for each service.Giving a string array means the rpc will be broadcast to these services as a notice.
* <code>[timeout]</code> &laquo;number&raquo;
* <code>[ignorecb]</code> &laquo;boolean&raquo; Default false. When you use simplerpc, if the last argument is Function type, it means a notice, not a request. Set the option true to force the rpc to be a notice.And The last argument will be encode even it is a Function.
* <code>[bytes]</code> &laquo;number&raquo; The default size of a pack is 1MB. And the head of pack may take tens of bytes.You can set a right number by this option.
### <a id="link:IClientOptions">IClientOptions</a>
* <code>service</code> &laquo;string&raquo; The unique string different from ench service.
* <code>connect</code> &laquo;Object&raquo;
    * <code>host</code> &laquo;string&raquo;
    * <code>port</code> &laquo;number&raquo;
* <code>[logger]</code> &laquo;any&raquo; You can set console or log4js to print logs.
* <code>[coding]</code> &laquo;string&raquo;
* <code>[callback_timeout]</code> &laquo;number&raquo;
* <code>[token]</code> &laquo;string&raquo;
### <a id="link:IServerOptions">IServerOptions</a>
* <code>listen</code> &laquo;Object&raquo;
    * <code>host</code> &laquo;string&raquo;
    * <code>port</code> &laquo;number&raquo;
    * <code>[exclusive]</code> &laquo;boolean&raquo;
* <code>[logger]</code> &laquo;any&raquo; You can set console or log4js to print logs.
* <code>[coding]</code> &laquo;string&raquo;
* <code>[token]</code> &laquo;string&raquo;
