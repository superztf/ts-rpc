import { IServerOptions } from '../utils/interface';
import { ProxyServer } from './proxyserver';

/**
 * Provide operations for removing server and updating token.
 * @see createProxy to get an instance
 * @name ServerHandle
 */
class ServerHandle {
    private proxy: ProxyServer;

    constructor(opts: IServerOptions) {
        this.proxy = new ProxyServer(opts);
    }

    /**
     * Close proxy server and release all references.
     * @method
     * @returns
     */
    public Remove() {
        this.proxy.CloseServer();
        (<any>this.proxy) = null;
    }

    /**
     * Open tokencheck by setting true, close by false. True is Default.
     * If setting false, checking will not effect either client sends token or not.
     * @member {boolean}
     */
    public set tokencheck(isopen: boolean) {
        this.proxy.tokencheck = isopen;
    }

    /**
     * Update token string. It will be priority before IServerOptions.token.
     * @member {string}
     */
    public set newtoken(token: string) {
        this.proxy.newtoken = token;
    }
}

/**
 * Create a ServerHandle instance and get it
 * @param {IServerOptions} opts
 * @returns {ServerHandle} instance of ServerHandle
 */
export function createProxy(opts: IServerOptions) {
    return new ServerHandle(opts);
}
