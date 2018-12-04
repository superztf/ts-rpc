import { IRPCReciver, ICallFuncOption, IClientOptions, RPCMODULE_EVENT } from '../utils/interface';
import { BufferRecv, BufferSend } from '../utils/bufferhelper';
import { ClientManager, logger } from './clientmanager';
import { EventEmitter } from 'events';

export class RPCModule extends EventEmitter implements IRPCReciver {
    public userEncode: ((args: any[]) => string | Buffer) | null = null;
    public userDecode: ((str: string | Buffer) => any[]) | null = null;
    public app: any;
    private manager: ClientManager;
    private seqID: number = 0;
    private callbacks: Map<number, { time: number, next: Function }> = new Map();
    private clientopts: IClientOptions;
    private getcoding: string = 'utf8';
    private intervalhd: NodeJS.Timeout | undefined;
    private otherapps: Set<string> = new Set();

    constructor(opts: IClientOptions, app: any) {
        super();
        this.clientopts = opts;
        if (opts.coding) {
            this.getcoding = opts.coding;
        }
        this.manager = new ClientManager(opts);
        this.manager.SetRPCReciver(this);
        this.app = app;
        this.intervalhd = setInterval(() => {
            const now = Date.now();
            for (const seqid of this.callbacks.keys()) {
                const info = this.callbacks.get(seqid);
                if (info && now > info.time) {
                    this.callbacks.delete(seqid);
                    info.next(new Error('callback timeout'), null);
                }
            }
        }, 500);
    }

    public RPCInitOver(recv: BufferRecv) {
        this.otherapps.clear();
        const len = recv.UnPacketUInt(2);
        for (let i = 0; i < len; ++i) {
            this.otherapps.add(recv.UnPacketPString(1));
        }
        this.emit(RPCMODULE_EVENT.REGISTED, this.service, Array.from(this.otherapps));
    }

    public RPCDisConnect() {
        this.otherapps.clear();
        try {
            this.emit(RPCMODULE_EVENT.CLOSE);
        } catch (err) {
            logger.error('RPCDisConnect emit error:', err);
        }
    }

    public ReleaseSelf() {
        this.callbacks.clear();
        try {
            this.manager.ReleaseSelf();
        } catch (err) {
            logger.error('ClientManager ReleaseSelf error:', err);
        }
        (this.encode as any) = null;
        (this.decode as any) = null;
        (this.manager as any) = null;
        (this.clientopts as any) = null;
        this.app = null;
        if (this.intervalhd) {
            clearInterval(this.intervalhd);
            this.intervalhd = undefined;
        }
    }

    public AddCallBack(next: Function, opts?: ICallFuncOption): number {
        const sid = this.newSeqid();
        let time = Date.now();
        if (opts && opts.timeout) {
            time += opts.timeout;
        } else {
            time += this.clientopts.callback_timeout ? this.clientopts.callback_timeout : 3000;
        }
        this.callbacks.set(sid, { time, next });
        return sid;
    }

    public GetMethodByRoute(route: string): Function {
        let curfun = this.app;
        for (const key of route.split('.')) {
            curfun = curfun[key];
            if (!curfun) {
                throw (new Error(`${this.service}, no such route: ${route}`));
            }
        }
        return curfun;
    }

    public SendNotice(opts: ICallFuncOption, route: string, args: any[]) {
        if (Array.isArray(opts.service)) {
            throw (new Error('ICallFuncOption.service should be a string when SendNotice'));
        }
        const send = new BufferSend(opts.bytes, this.getcoding);
        const argmsg = this.encode(args);
        this.manager.PrepareNotice(opts.service, send);
        send.PacketAddPString(route, 1);
        if (argmsg instanceof Buffer) {
            send.PacketAddUInt(1, 1);
            send.PacketAddPBuffer(argmsg, 2);
        } else {
            send.PacketAddUInt(0, 1);
            send.PacketAddPString(argmsg, 2);
        }
        this.manager.SendBuffer(send.GetBuffer());
    }

    public BroadNotice(opts: ICallFuncOption, services: string[], route: string, args: any[]) {
        const send = new BufferSend(opts.bytes, this.getcoding);
        const argmsg = this.encode(args);
        this.manager.PrepareBroad(services, send);
        send.PacketAddPString(route, 1);
        if (argmsg instanceof Buffer) {
            send.PacketAddUInt(1, 1);
            send.PacketAddPBuffer(argmsg, 2);
        } else {
            send.PacketAddUInt(0, 1);
            send.PacketAddPString(argmsg, 2);
        }
        this.manager.SendBuffer(send.GetBuffer());
    }

    public SendRequest(opts: ICallFuncOption, route: string, args: any[], next: Function) {
        if (Array.isArray(opts.service)) {
            throw (new Error('ICallFuncOption.service should be a string when SendRequest'));
        }
        const sid = this.AddCallBack(next, opts);
        const send = new BufferSend(opts.bytes, this.getcoding);
        const argmsg = this.encode(args);
        this.manager.PrepareRequest(opts.service, send);
        send.PacketAddPString(route, 1);
        if (argmsg instanceof Buffer) {
            send.PacketAddUInt(1, 1);
            send.PacketAddPBuffer(argmsg, 2);
        } else {
            send.PacketAddUInt(0, 1);
            send.PacketAddPString(argmsg, 2);
        }
        send.PacketAddPString(this.service, 1);
        send.PacketAddUInt(sid, 4);
        this.manager.SendBuffer(send.GetBuffer());
    }

    public SendResponse(service: string, sid: number, args: any[]) {
        const send = new BufferSend(undefined, this.getcoding);
        const argmsg = this.encode(args);
        this.manager.PrepareResponse(service, send);
        send.PacketAddUInt(sid, 4);
        if (argmsg instanceof Buffer) {
            send.PacketAddUInt(1, 1);
            send.PacketAddPBuffer(argmsg, 2);
        } else {
            send.PacketAddUInt(0, 1);
            send.PacketAddPString(argmsg, 2);
        }
        this.manager.SendBuffer(send.GetBuffer());
    }

    public RecvNotice(recv: BufferRecv): void {
        const route = recv.UnPacketPString(1);
        const type = recv.UnPacketUInt(1);
        let argmsg: string | Buffer;
        if (type) {
            argmsg = recv.UnPacketPBuffer(2);
        } else {
            argmsg = recv.UnPacketPString(2);
        }
        const args = this.decode(argmsg);
        this.GetMethodByRoute(route)(...args);
    }

    public RecvRequest(recv: BufferRecv) {
        const route = recv.UnPacketPString(1);
        const type = recv.UnPacketUInt(1);
        let argmsg: string | Buffer;
        if (type) {
            argmsg = recv.UnPacketPBuffer(2);
        } else {
            argmsg = recv.UnPacketPString(2);
        }
        const args = this.decode(argmsg);
        const service = recv.UnPacketPString(1);
        const sid = recv.UnPacketUInt(4);
        const func = this.GetMethodByRoute(route);
        func(...args, (...backargs: any[]) => {
            this.SendResponse(service, sid, backargs);
        });
    }

    public RecvResponse(recv: BufferRecv): void {
        const sid = recv.UnPacketUInt(4);
        if (!this.callbacks.has(sid)) {
            logger.error(this.service, 'RecvResponse but no callback func', sid);
            return;
        }
        const type = recv.UnPacketUInt(1);
        let argmsg: string | Buffer;
        if (type) {
            argmsg = recv.UnPacketPBuffer(2);
        } else {
            argmsg = recv.UnPacketPString(2);
        }
        const args = this.decode(argmsg);
        const info = this.callbacks.get(sid);
        if (info) {
            this.callbacks.delete(sid);
            info.next(...args);
        }
    }

    public QueryOtherApps(): string[] {
        return Array.from(this.otherapps);
    }

    public RecvOtherReg(key: string) {
        this.otherapps.add(key);
        this.emit(RPCMODULE_EVENT.OTHER_REG, key);
    }

    public RecvOtherUnReg(key: string) {
        this.otherapps.delete(key);
        this.emit(RPCMODULE_EVENT.OTHER_UNREG, key);
    }

    private newSeqid() {
        if (this.seqID >= 0xffffffff) {
            this.seqID = 0;
        }
        this.seqID++;
        return this.seqID;
    }

    private get service() {
        return this.clientopts.service;
    }

    private get encode() {
        if (this.userEncode) {
            return this.userEncode;
        }
        return this._encode;
    }

    private get decode() {
        if (this.userDecode) {
            return this.userDecode;
        }
        return this._decode;
    }

    private _encode: (args: any[]) => string | Buffer = (args: any[]) => {
        return JSON.stringify({ args });
    };

    private _decode: (str: string | Buffer) => any[] = (str: string | Buffer) => {
        return JSON.parse(<string>str).args;
    };
}
