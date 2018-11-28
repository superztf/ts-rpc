declare module 'ts-rpc' {
    /// <reference types="node" />
    import { EventEmitter } from 'events';
    /**
     * =================interface======================
     */
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

    export const enum CLIENTHANDLE_EVENT {
        REGISTED = 'USER_REGISTED',
        CLOSE = 'USER_CLOSE',
        OTHER_RIGISTED = 'USER_OTHER_RIGISTED',
        OTHER_CLOSE = 'USER_OTHER_CLOSE'
    }

    export interface ICallFuncOption {
        timeout?: number;
        service: string | string[];
        ignorecb?: boolean;
        bytes?: number;
    }
    /**
     * =================Client API======================
     */
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
    export class ClientHandle extends EventEmitter {
        public readonly otherapps: string[];
        private rpcmodule;
        private registecb;
        private tempfunopts;

        constructor(opts: IClientOptions, app: any, cb: Function);
        /**
         * Disconnect from proxy server and release all references
         * @method
         * @returns
         */
        public Remove(): void;
        /**
         * proxy attribute
         * @see .\test\start_client2 to get an example
         * @method
         * @param {string} [route] the beginning string of route
         * @returns {Object|Function}
         */
        public ProxyRoute(route?: string): any;

        /**
         * set default ICallFuncOption
         * @method
         * @param {ICallFuncOption} opts simplerpc or promirpc will use this opts if you do not give ICallFuncOption
         * @returns
         */
        public SetCallFuncOpts(opts: ICallFuncOption | undefined): void;
        /**
         * the default encode:JSON.stringify,decode:JSON.parse. here set your own encode,decode for rpc's arguments.
         * @method
         * @param {Function} encode
         * @param {Function} decode
         * @returns
         */
        public setEncodeDecode(encode: (args: any[]) => string | Buffer, decode: (str: string | Buffer) => any[]): void;
        /**
         * query the list of other services who has been connected to proxy server
         * @method
         * @returns {string[]}
         */
    }
    /**
     * connnect proxyserver
     * @param {IClientOptions} opts
     * @param {Object} app
     * @param {createClient-CallBack} cb
     */
    export function createClient(opts: IClientOptions, app: any, cb?: (err: Error | null, obj: ClientHandle) => void): ClientHandle;
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
    export function createClientSync(opts: IClientOptions, app: any): Promise<ClientHandle>;

    /**
     * =================Server API======================
     */
    /**
     * Provide operations for removing server and updating token.
     * @see createProxy to get an instance
     * @name ServerHandle
     */
    export class ServerHandle {
        /**
         * Open tokencheck by setting true, close by false. True is Default.
         * If setting false, checking will not effect either client sends token or not.
         * @member {boolean}
         */
        public tokencheck: boolean;
        /**
         * Update token string. It will be priority before IServerOptions.token.
         * @member {string}
         */
        public newtoken: string;
        private proxy;
        constructor(opts: IServerOptions);
        /**
         * Close proxy server and release all references.
         * @method
         * @returns
         */
        public Remove(): void;
    }
    /**
     * Create a ServerHandle instance and get it
     * @param {IServerOptions} opts
     * @returns {ServerHandle} instance of ServerHandle
     */
    export function createProxy(opts: IServerOptions): ServerHandle;

}
