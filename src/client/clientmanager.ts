import * as net from 'net';
import { BufferRecv, BufferSend, BufferQueue } from '../utils/bufferhelper';
import { Emptylogger, encryptkey } from '../utils/tools';
import { IClientOptions, SOCKET_STATE, IRPCReciver } from '../utils/interface';
import { SERVER_OP, CLIENT_OP } from '../utils/protocol';
export let logger = Emptylogger;

const RETRY_CONNECT_INTERVAL = 5000;
const SERVICE_MAX_LENGTH = 1024;

export class ClientManager {
    private service: string;
    private socket: net.Socket;
    private sockethealth: SOCKET_STATE = SOCKET_STATE.NONE;
    private retryhandle: NodeJS.Timeout | null = null;
    private address: net.NetConnectOpts;
    private coding: string = 'utf8';
    private rpcreciver: IRPCReciver | undefined | null;
    private opts: IClientOptions;
    private bufferqueue: BufferQueue = new BufferQueue();
    private nodeversion = 0;

    constructor(opts: IClientOptions) {
        this.opts = opts;
        this.service = opts.service;
        this.address = opts.connect;
        if (opts.coding) {
            this.coding = opts.coding;
        }
        if (opts.logger) {
            logger = opts.logger;
        }
        this.socket = net.createConnection(opts.connect);
        this.initSocketEvent();
        const match = /^v(\d+\.\d+)\.\d+/.exec(process.version);
        if (match) {
            this.nodeversion = parseFloat(match[1]);
        }
    }

    public SetRPCReciver(obj: IRPCReciver) {
        this.rpcreciver = obj;
    }

    public ReleaseSelf() {
        this.unregiste();
        this.rpcreciver = null;
        (this.address as any) = null;
        if (this.retryhandle) {
            clearInterval(this.retryhandle);
            this.retryhandle = null;
        }
        this.socket.removeAllListeners();
        this.socket.destroy();
        this.socket.unref();
        (this.socket as any) = null;
        this.updateSocketState(SOCKET_STATE.NONE);
        logger = Emptylogger;
    }

    public SendBuffer(msgbuf: Buffer): boolean {
        if (this.sockethealth !== SOCKET_STATE.READY && this.sockethealth !== SOCKET_STATE.REGISTED) {
            logger.debug(this.service, 'send buffer while socketstate not ok');
            return false;
        }
        const ret = this.socket.write(msgbuf);
        if (!ret) {
            logger.error(this.service, 'write buffer failed');
        }
        return ret;
    }

    public PrepareNotice(service: string, send: BufferSend) {
        send.PacketAddUInt(SERVER_OP.client_message, 1);
        send.PacketAddPString(service, 1);
        send.PacketAddUInt(CLIENT_OP.notice, 1);
    }

    public PrepareBroad(services: string[], send: BufferSend) {
        send.PacketAddUInt(SERVER_OP.client_broadcast, 1);
        send.PacketAddUInt(services.length, 2);
        for (const s of services) {
            send.PacketAddPString(s, 1);
        }
        send.PacketAddUInt(CLIENT_OP.notice, 1);
    }

    public PrepareRequest(service: string, send: BufferSend) {
        send.PacketAddUInt(SERVER_OP.client_message, 1);
        send.PacketAddPString(service, 1);
        send.PacketAddUInt(CLIENT_OP.request, 1);
    }

    public PrepareResponse(service: string, send: BufferSend) {
        send.PacketAddUInt(SERVER_OP.client_message, 1);
        send.PacketAddPString(service, 1);
        send.PacketAddUInt(CLIENT_OP.response, 1);
    }

    private registe() {
        const send = new BufferSend(SERVICE_MAX_LENGTH, this.coding);
        send.PacketAddUInt(SERVER_OP.client_registe, 1);
        send.PacketAddPString(this.service, 1);
        if (this.opts.token) {
            const value = encryptkey(this.service, this.opts.token);
            send.PacketAddUInt(value, 4);
        }
        this.SendBuffer(send.GetBuffer());
    }

    private unregiste() {
        const send = new BufferSend(SERVICE_MAX_LENGTH, this.coding);
        send.PacketAddUInt(SERVER_OP.client_unregiste, 1);
        this.SendBuffer(send.GetBuffer());
    }

    private retryConnect() {
        if (this.socket && !this.retryhandle) {
            let cnt = 0;
            this.socket.destroy();
            this.retryhandle = setInterval(() => {
                if (this.sockethealth === SOCKET_STATE.CONNECTING) {
                    cnt += 1;
                    logger.debug(this.service, 'socket connecting', cnt);
                    return;
                }
                this.updateSocketState(SOCKET_STATE.CONNECTING);
                this.socket = net.createConnection(this.address);
                this.initSocketEvent();
            }, RETRY_CONNECT_INTERVAL);
        }
    }

    private updateSocketState(st: SOCKET_STATE) {
        if (this.sockethealth === SOCKET_STATE.REGISTED && st !== SOCKET_STATE.REGISTED) {
            if (this.rpcreciver) {
                this.rpcreciver.RPCDisConnect();
            }
        }
        this.sockethealth = st;
    }

    private initSocketEvent() {
        this.socket.on('close', (haderror: boolean) => {
            this.updateSocketState(SOCKET_STATE.CLOSE);
            logger.debug(this.service, 'on socket close event', haderror);
            this.retryConnect();
        });
        this.socket.on('connect', () => {
            this.updateSocketState(SOCKET_STATE.CONNECTED);
            logger.debug(this.service, 'on socket connect event');
            if (this.retryhandle) {
                clearInterval(this.retryhandle);
                this.retryhandle = null;
            }
            if (this.nodeversion < 9.11) {
                this.socket.emit('ready');
            }
        });
        this.socket.on('data', (data: Buffer) => {
            try {
                this.bufferqueue.Push(data);
                const list: Buffer[] = this.bufferqueue.PopList();
                for (const buffer of list) {
                    try {
                        this.onCommand(buffer);
                    } catch (err) {
                        logger.error(this.service, 'do onCommand error:', err);
                    }
                }
            } catch (err) {
                this.bufferqueue.Reset();
                logger.error(this.service, 'on Data error:', err);
            }
        });
        this.socket.on('drain', () => {
            logger.debug(this.service, 'on socket drain event');
        });
        this.socket.on('end', () => {
            this.updateSocketState(SOCKET_STATE.END);
            logger.debug(this.service, 'on socket end event');
            this.retryConnect();
        });
        this.socket.on('error', (err: Error) => {
            this.updateSocketState(SOCKET_STATE.ERROR);
            logger.debug(this.service, 'on socket error event', err);
            this.retryConnect();
        });
        this.socket.on('lookup', (err: Error | null, address: string, family: string | null, host: string) => {
            logger.info(this.service, 'on socket lookup event');
        });
        this.socket.on('ready', () => {
            if (this.sockethealth === SOCKET_STATE.REGISTED) {
                logger.error(this.service, 'has been registed');
                return;
            }
            logger.debug(this.service, 'on socket ready event');
            this.updateSocketState(SOCKET_STATE.READY);
            this.registe();
            setTimeout(() => {
                if (this.sockethealth !== SOCKET_STATE.REGISTED) {
                    logger.error(this.service, 'registe time out');
                    this.retryConnect();
                }
            }, RETRY_CONNECT_INTERVAL);
        });
        this.socket.on('timeout', () => {
            logger.debug(this.service, 'on socket timeout event');
        });
    }

    private onCommand(buffer: Buffer) {
        const recv = new BufferRecv(buffer, this.coding);
        const op: CLIENT_OP = recv.UnPacketUInt(1);
        logger.info(this.service, 'recv op', op, buffer.length);
        if (op === CLIENT_OP.notice) {
            if (this.rpcreciver) {
                this.rpcreciver.RecvNotice(recv);
            }
        } else if (op === CLIENT_OP.request) {
            if (this.rpcreciver) {
                this.rpcreciver.RecvRequest(recv);
            }
        } else if (op === CLIENT_OP.response) {
            if (this.rpcreciver) {
                this.rpcreciver.RecvResponse(recv);
            }
        } else if (op === CLIENT_OP.s2c_registe) {
            if (this.rpcreciver) {
                this.rpcreciver.RecvOtherReg(recv.UnPacketString());
            }
        } else if (op === CLIENT_OP.s2c_unregiste) {
            if (this.rpcreciver) {
                this.rpcreciver.RecvOtherUnReg(recv.UnPacketString());
            }
        } else if (op === CLIENT_OP.registe_result) {
            const key = recv.UnPacketPString(1);
            if (key === this.service) {
                logger.info(this.service, 'registe success');
                this.updateSocketState(SOCKET_STATE.REGISTED);
                if (this.rpcreciver) {
                    this.rpcreciver.RPCInitOver(recv);
                }
            } else {
                logger.error(this.service, 'proxy server registe key result not equal ', key);
            }
        } else {
            logger.error(this.service, 'Unrecognized CLIENT_OP', op);
        }
    }
}
