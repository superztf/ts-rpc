import { EventEmitter } from 'events';
import { IClientOptions, ICallFuncOption, RPCMODULE_EVENT, CLIENTHANDLE_EVENT } from '../utils/interface';
import * as nodeutil from 'util';
import { RPCModule } from './rpcmodule';
import { logger } from './clientmanager';

export function simplerpc(func: () => void): () => void;
export function simplerpc<A1>(func: (a1: A1) => void): (a1: A1) => void;
export function simplerpc<A1, A2>(func: (a1: A1, a2: A2) => void): (a1: A1, a2: A2) => void;
export function simplerpc<A1, A2, A3>(func: (a1: A1, a2: A2, a3: A3) => void): (a1: A1, a2: A2, a3: A3) => void;
export function simplerpc<A1, A2, A3, A4>(func: (a1: A1, a2: A2, a3: A3, a4: A4) => void): (a1: A1, a2: A2, a3: A3, a4: A4) => void;
export function simplerpc<A1, A2, A3, A4, A5>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void;
export function simplerpc<A1, A2, A3, A4, A5, A6>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => void;
export function simplerpc<A1, A2, A3, A4, A5, A6, A7>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => void;

export function simplerpc(opts: ICallFuncOption, func: () => void): () => void;
export function simplerpc<A1>(opts: ICallFuncOption, func: (a1: A1) => void): (a1: A1) => void;
export function simplerpc<A1, A2>(opts: ICallFuncOption, func: (a1: A1, a2: A2) => void): (a1: A1, a2: A2) => void;
export function simplerpc<A1, A2, A3>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3) => void): (a1: A1, a2: A2, a3: A3) => void;
export function simplerpc<A1, A2, A3, A4>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4) => void): (a1: A1, a2: A2, a3: A3, a4: A4) => void;
export function simplerpc<A1, A2, A3, A4, A5>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void;
export function simplerpc<A1, A2, A3, A4, A5, A6>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => void;
export function simplerpc<A1, A2, A3, A4, A5, A6, A7>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => void;
/**
 * Wrapper of calling other apps function
 * @param {ICallFuncOption} [opts]
 * @param {Function} func
 * @returns {Function}
 */
export function simplerpc(opts?: ICallFuncOption | Function | null | undefined, func?: Function): Function {
    if (opts instanceof Function) {
        func = opts;
        opts = null;
    }
    return (...args: any[]) => {
        return (<Function>func)(opts, ...args);
    };
}

export function promirpc<T>(func: (next: (err: any, ret?: T) => void) => void): () => Promise<T>;
export function promirpc<T, A1>(func: (a1: A1, next: (err: any, ret?: T) => void) => void): (a1: A1) => Promise<T>;
export function promirpc<T, A1, A2>(func: (a1: A1, a2: A2, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2) => Promise<T>;
export function promirpc<T, A1, A2, A3>(func: (a1: A1, a2: A2, a3: A3, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4>(func: (a1: A1, a2: A2, a3: A3, a4: A4, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5, A6>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5, A6, A7>(func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Promise<T>;

export function promirpc<T>(opts: ICallFuncOption, func: (next: (err: any, ret?: T) => void) => void): () => Promise<T>;
export function promirpc<T, A1>(opts: ICallFuncOption, func: (a1: A1, next: (err: any, ret?: T) => void) => void): (a1: A1) => Promise<T>;
export function promirpc<T, A1, A2>(opts: ICallFuncOption, func: (a1: A1, a2: A2, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2) => Promise<T>;
export function promirpc<T, A1, A2, A3>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5, A6>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Promise<T>;
export function promirpc<T, A1, A2, A3, A4, A5, A6, A7>(opts: ICallFuncOption, func: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, next: (err: any, ret?: T) => void) => void): (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Promise<T>;
/**
 * Promise wrapper of calling other apps function
 * @param {ICallFuncOption} [opts]
 * @param {Function} func
 * @returns {Promise}
 */
export function promirpc(opts?: ICallFuncOption | Function | null | undefined, func?: Function) {
    if (opts instanceof Function) {
        func = opts;
        opts = null;
    }
    return nodeutil.promisify((...args: any[]) => {
        return (<Function>func)(opts, ...args);
    });
}

class ClientHandle extends EventEmitter {
    private rpcmodule: RPCModule;
    private registecb: Function | null;
    private tempfunopts: ICallFuncOption | undefined | null;

    constructor(opts: IClientOptions, app: any, cb: Function) {
        super();
        this.registecb = cb;
        this.rpcmodule = new RPCModule(opts, app);
        this.rpcmodule.on(RPCMODULE_EVENT.REGISTED, (key: string, others: string[]) => {
            if (this.registecb) {
                this.registecb(null, this);
                this.registecb = null;
            }
            try {
                /**
                 * My app connect proxy server success.
                 * @event CLIENTHANDLE_EVENT.REGISTED
                 * @type {string} my app service name
                 * @type {string[]} array of other apps name
                 */
                this.emit(CLIENTHANDLE_EVENT.REGISTED, key, others);
            } catch (err) {
                logger.error('CLIENTHANDLE_EVENT.REGISTED emit error:', err);
            }
        });

        this.rpcmodule.on(RPCMODULE_EVENT.CLOSE, () => {
            try {
                /**
                 * My app disconnect.
                 * @event CLIENTHANDLE_EVENT.CLOSE
                 */
                this.emit(CLIENTHANDLE_EVENT.CLOSE);
            } catch (err) {
                logger.error('CLIENTHANDLE_EVENT.CLOSE emit error:', err);
            }
        });

        this.rpcmodule.on(RPCMODULE_EVENT.OTHER_REG, (key: string) => {
            try {
                /**
                 * Other app connect.
                 * @event CLIENTHANDLE_EVENT.OTHER_RIGISTED
                 */
                this.emit(CLIENTHANDLE_EVENT.OTHER_RIGISTED, key);
            } catch (err) {
                logger.error('CLIENTHANDLE_EVENT.OTHER_RIGISTED:', err);
            }
        });

        this.rpcmodule.on(RPCMODULE_EVENT.OTHER_UNREG, (key: string) => {
            try {
                /**
                 * Other app disconnect.
                 * @event CLIENTHANDLE_EVENT.OTHER_CLOSE
                 */
                this.emit(CLIENTHANDLE_EVENT.OTHER_CLOSE, key);
            } catch (err) {
                logger.error('CLIENTHANDLE_EVENT.OTHER_CLOSE:', err);
            }
        });
    }

    /**
     * Disconnect from proxy server and release all references
     * @method
     * @returns
     */
    public Remove() {
        try {
            this.rpcmodule.ReleaseSelf();
        } catch (err) {
            logger.error('rpcmodule ReleaseSelf error:', err);
        }
        (this.rpcmodule as any) = null;
        this.registecb = null;
        this.tempfunopts = null;
        this.removeAllListeners();
    }

    /**
     * proxy attribute
     * @see .\test\start_client2 to get an example
     * @method
     * @param {string} [route] the beginning string of route
     * @returns {Object|Function}
     */
    public ProxyRoute(route: string = ''): any {
        const realdofunc = (opts: ICallFuncOption | null | undefined, ...args: any[]) => {
            if (!opts) {
                if (!this.tempfunopts) {
                    logger.error('Neither give ICallFuncOption nor SetCallFuncOpts before');
                    return;
                }
                opts = this.tempfunopts;
            }
            if (Array.isArray(opts.service)) {
                this.rpcmodule.BroadNotice(opts, opts.service, route, args);
                return;
            }
            let cbfunc: Function | undefined;
            if (!opts.ignorecb && args.length > 0 && args[args.length - 1] instanceof Function) {
                cbfunc = args[args.length - 1];
                args.pop();
            }
            if (cbfunc) {
                this.rpcmodule.SendRequest(opts, route, args, cbfunc);
            } else {
                this.rpcmodule.SendNotice(opts, route, args);
            }
        };
        const self = this;
        return new Proxy(realdofunc, {
            get(target: any, p: string, receiver: any) {
                const s = route ? `${route}.${p}` : p;
                return (<any>realdofunc)[p] || self.ProxyRoute(s);
            },
        });
    }

    public ProxySRoute(route: string = '') {
        // use route's first part as target service
    }

    /**
     * set default ICallFuncOption
     * @method
     * @param {ICallFuncOption} opts simplerpc or promirpc will use this opts if you do not give ICallFuncOption
     * @returns
     */
    public SetCallFuncOpts(opts: ICallFuncOption | undefined) {
        this.tempfunopts = opts;
    }

    /**
     * the default encode:JSON.stringify,decode:JSON.parse. here set your own encode,decode for rpc's arguments.
     * @method
     * @param {Function} encode
     * @param {Function} decode
     * @returns
     */
    public setEncodeDecode(encode: (args: any[]) => string | Buffer, decode: (str: string | Buffer) => any[]) {
        this.rpcmodule.userEncode = encode;
        this.rpcmodule.userDecode = decode;
    }

    /**
     * query the list of other services who has been connected to proxy server
     * @method
     * @returns {string[]}
     */
    public get otherapps(): string[] {
        return this.rpcmodule.QueryOtherApps();
    }
}

/**
 * connnect proxyserver
 * @param {IClientOptions} opts
 * @param {Object} app
 * @param {createClient-CallBack} cb
 */
export function createClient(opts: IClientOptions, app: any, cb?: (err: Error | null, obj: ClientHandle) => void): ClientHandle {
    if (!cb) {
        // tslint:disable-next-line:no-empty
        cb = () => { };
    }
    return new ClientHandle(opts, app, cb);
}
/** createClient's callback function
 * @see createClient
 * @callback createClient-CallBack
 * @param {Error|null} err
 * @param {ClientHandle} obj
 * @returns
 */

/**
 * the same as createClient,but return ClientHandle as a promise
 * @see createClient
 * @param {IClientOptions} opts
 * @param {Object} app
 * @returns {Promise<ClientHandle>}
 */
export async function createClientSync(opts: IClientOptions, app: any): Promise<ClientHandle> {
    return await nodeutil.promisify(createClient)(opts, app);
}
