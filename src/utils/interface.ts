import { BufferRecv } from './bufferhelper';

export interface IServerOptions {
    listen: {
        host: string;
        port: number;
        exclusive?: boolean;
    };
    logger?: any;
    coding?: string;
    token?: string;
}

export interface IClientOptions {
    service: string;
    connect: {
        host: string;
        port: number;
    };
    logger?: any;
    coding?: string;
    callback_timeout?: number;
    token?: string;
}

export enum SOCKET_STATE {
    NONE,
    CONNECTED,
    CONNECTING,
    READY,
    ERROR,
    CLOSE,
    END,
    REGISTED, // can send message only in this state
}

export const enum RPCMODULE_EVENT {
    REGISTED = 'REGISTED',
    CLOSE = 'CLOSE',
    OTHER_REG = 'OTHER_REG',
    OTHER_UNREG = 'OTHER_UNREG',
}

export const enum CLIENTHANDLE_EVENT {
    REGISTED = 'USER_REGISTED',
    CLOSE = 'USER_CLOSE',
    OTHER_RIGISTED = 'USER_OTHER_RIGISTED',
    OTHER_CLOSE = 'USER_OTHER_CLOSE',
}

export interface IRPCReciver {
    RPCInitOver(data: BufferRecv): void;
    RPCDisConnect(): void;
    RecvNotice(data: BufferRecv): void;
    RecvRequest(data: BufferRecv): void;
    RecvResponse(data: BufferRecv): void;
    RecvOtherUnReg(key: string): void;
    RecvOtherReg(key: string): void;
}

export interface ICallFuncOption {
    timeout?: number; // useless when rpc has no callback function
    service: string | string[]; // while the service is a string array, message will be broadcasted as notice
    ignorecb?: boolean; // when you use simplerpc and the last args is a function but not be used as a callback func, set this option true.
    bytes?: number; // if rpcs argument buffer length bigger than 1MB, should set right a bytes number
}
