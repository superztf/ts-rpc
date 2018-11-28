import * as net from 'net';
import { IServerOptions } from '../utils/interface';
import { ClientLink } from './clientlink';
import { BufferRecv, BufferSend, HEAD_BYTE } from '../utils/bufferhelper';
import { SERVER_OP, CLIENT_OP } from '../utils/protocol';
import { Emptylogger, checkkey } from '../utils/tools';

export let logger = Emptylogger;

export class ProxyServer {
    public newtoken: string = '';
    public tokencheck: boolean = true;
    private server: net.Server;
    private clients: Map<string, ClientLink> = new Map();
    private coding: string = 'utf8';
    private opts: IServerOptions;

    constructor(opts: IServerOptions) {
        this.opts = opts;
        if (opts.logger) {
            logger = opts.logger;
        }
        if (opts.coding) {
            this.coding = opts.coding;
        }
        this.server = net.createServer({ allowHalfOpen: false, pauseOnConnect: false });
        this.initServerEvent();
        this.server.listen(opts.listen);
    }

    public ClearClients(linkobj: ClientLink) {
        this.clients.delete(linkobj.key);
    }

    public CloseServer() {
        for (const key of this.clients.keys()) {
            const link = this.clients.get(key);
            if (link) {
                link.ReleaseSelf();
            }
        }
        this.clients.clear();
        (<any>this.opts) = null;
        this.server.close();
        this.server.unref();
        (<any>this.server) = null;
    }

    public OnLinkRemove(key: string) {
        if (this.clients.size > 0) {
            const send = new BufferSend(key.length * 4, this.coding);
            send.PacketAddUInt(CLIENT_OP.s2c_unregiste, 1);
            send.PacketAddString(key);
            const buf = send.GetBuffer();
            for (const c of this.clients.values()) {
                c.SendBuffer(buf);
            }
        }
    }

    public OnLinkRegiste(key: string) {
        if (this.clients.size > 0) {
            const send = new BufferSend(key.length * 4, this.coding);
            send.PacketAddUInt(CLIENT_OP.s2c_registe, 1);
            send.PacketAddString(key);
            const buf = send.GetBuffer();
            for (const c of this.clients.values()) {
                c.SendBuffer(buf);
            }
        }
    }

    public onCommand(linkobj: ClientLink, buffer: Buffer) {
        const recv = new BufferRecv(buffer, this.coding);
        const op: SERVER_OP = recv.UnPacketUInt(1);
        logger.info(linkobj.key, 'link onCommand', op);

        if (op === SERVER_OP.client_registe) {
            const key = recv.UnPacketPString(1);
            if (this.clients.has(key)) {
                logger.error('cannot register existed key', key);
            } else {
                const token = this.newtoken ? this.newtoken : this.opts.token;
                if (token && this.tokencheck) {
                    const value = recv.UnPacketUInt(4);
                    if (!checkkey(key, token, value)) {
                        logger.error(key, 'error token connnected', linkobj.socketinfo);
                        linkobj.ReleaseSelf();
                        return;
                    }
                }
                linkobj.registe(key);
                const send = new BufferSend(undefined, this.coding);
                send.PacketAddUInt(CLIENT_OP.registe_result, 1);
                send.PacketAddPString(key, 1);
                send.PacketAddUInt(this.clients.size, 2);
                for (const s of this.clients.keys()) {
                    send.PacketAddPString(s, 1);
                }
                linkobj.SendBuffer(send.GetBuffer());
                this.OnLinkRegiste(key);
                this.clients.set(key, linkobj);
            }
            return;
        } else if (!this.clients.has(linkobj.key)) {
            logger.error('should registe before send msg', linkobj.socketinfo);
            linkobj.ReleaseSelf();
            return;
        }

        if (op === SERVER_OP.client_message) {
            const key = recv.UnPacketPString(1);
            const targetc = this.clients.get(key);
            if (targetc) {
                const send = new BufferSend(recv.BufferLength() + HEAD_BYTE, this.coding);
                send.PacketAddBuffer(recv.GetBuffer());
                targetc.SendBuffer(send.GetBuffer());
            } else {
                logger.error(linkobj.key, 'no target:', key);
            }
        } else if (op === SERVER_OP.client_broadcast) {
            const len = recv.UnPacketUInt(2);
            const services: string[] = [];
            for (let i = 0; i < len; ++i) {
                services.push(recv.UnPacketPString(1));
            }
            const send = new BufferSend(recv.BufferLength() + HEAD_BYTE, this.coding);
            send.PacketAddBuffer(recv.GetBuffer());
            for (const key of services) {
                const targetc = this.clients.get(key);
                if (targetc) {
                    targetc.SendBuffer(send.GetBuffer());
                } else {
                    logger.error(linkobj.key, 'broad but no target:', key, services);
                }
            }
        } else if (op === SERVER_OP.client_unregiste) {
            linkobj.ReleaseSelf();
        } else {
            logger.error('Unrecognized SERVER_OP', op);
        }
    }

    private initServerEvent() {
        this.server.on('close', () => {
            logger.debug('on server close event');
        });

        this.server.on('connection', (socket: net.Socket) => {
            logger.debug('on server connection event');
            const link = new ClientLink(this, socket);
            setTimeout(() => {
                if (link.isremove) {
                    return;
                }
                if (!link.key || !this.clients.has(link.key)) {
                    logger.error('wait for registe time out', link.socketinfo);
                    link.ReleaseSelf();
                }
            }, 5000);
        });

        this.server.on('error', (err: Error) => {
            logger.debug('on server error event', err);
        });

        this.server.on('listening', () => {
            logger.debug('on server listening event');
        });
    }
}
