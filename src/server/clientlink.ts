import * as net from 'net';
import { ProxyServer, logger } from './proxyserver';
import { BufferQueue } from '../utils/bufferhelper';

export class ClientLink {
    private manager: ProxyServer;
    private socket: net.Socket;
    private service: string = '';
    private errorcnt: number = 0;
    private removed: boolean = false;
    private bufferqueue: BufferQueue = new BufferQueue();

    constructor(manager: ProxyServer, socket: net.Socket) {
        this.manager = manager;
        this.socket = socket;
        this.initSocketEvent();
    }

    public get socketinfo(): string {
        if (this.removed) {
            return '';
        }
        return `${this.socket.remoteFamily}:${this.socket.remoteAddress}:${this.socket.remotePort}`;
    }

    public get key(): string {
        return this.service;
    }

    public registe(name: string) {
        this.service = name;
    }

    public get isremove() {
        return this.removed;
    }

    public SendBuffer(msgbuf: Buffer): boolean {
        const ret = this.socket.write(msgbuf);
        if (!ret) {
            logger.error(this.key, 'write buffer failed');
        }
        return ret;
    }

    public ReleaseSelf() {
        if (this.removed) {
            return;
        }
        this.manager.ClearClients(this);
        this.socket.removeAllListeners();
        this.socket.destroy();
        this.socket.unref();
        (this.socket as any) = null;
        try {
            this.manager.OnLinkRemove(this.key);
        } catch (err) {
            logger.error('OnLinkRemove error:', err);
        }
        (this.manager as any) = null;
        this.removed = true;
    }

    private initSocketEvent() {
        this.socket.on('close', (haderror: boolean) => {
            logger.debug(this.key, 'on socket close event', haderror);
            this.ReleaseSelf();
        });
        this.socket.on('connect', () => {
            logger.debug(this.key, 'on socket connect event');
        });
        this.socket.on('data', (data: Buffer) => {
            try {
                this.bufferqueue.Push(data);
                const list: Buffer[] = this.bufferqueue.PopList();
                for (const buffer of list) {
                    try {
                        this.manager.onCommand(this, buffer);
                        if (this.errorcnt) {
                            this.errorcnt = 0;
                        }
                    } catch (err) {
                        this.errorcnt += 1;
                        logger.error(this.key, 'do onCommand error:', this.errorcnt, err);
                    }
                }
                if (this.errorcnt >= 5) {
                    logger.error('too much errors.remove socket ', this.socketinfo);
                    this.ReleaseSelf();
                }

            } catch (err) {
                this.bufferqueue.Reset();
                this.errorcnt += 1;
                logger.error(this.key, 'on data error:', this.errorcnt, err);
            }
        });
        this.socket.on('drain', () => {
            logger.debug(this.key, 'on socket drain event');
        });
        this.socket.on('end', () => {
            logger.debug(this.key, 'on socket end event');
        });
        this.socket.on('error', (err: Error) => {
            logger.debug(this.key, 'on socket error event', err);
        });
        this.socket.on('lookup', (err: Error | null, address: string, family: string | null, host: string) => {
            logger.debug(this.key, 'on socket lookup event');
        });
        this.socket.on('ready', () => {
            logger.debug(this.key, 'on socket ready event');
        });
        this.socket.on('timeout', () => {
            logger.debug(this.key, 'on socket timeout event');
        });
    }
}
