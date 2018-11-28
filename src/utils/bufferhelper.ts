export const HEAD_BYTE = 2;

export class BufferSend {
    private buffer: Buffer;
    private offset: number = 0;
    private coding: string = 'utf8';
    private headmode: boolean;

    constructor(bytes?: number, CODING?: string, head = true) {
        if (!bytes) {
            bytes = 1048576; // default alloc 1MB
        }
        if (CODING) {
            this.coding = CODING;
        }
        this.headmode = head;
        this.buffer = Buffer.alloc(bytes);
        if (this.headmode) {
            this.PacketAddUInt(0, HEAD_BYTE);
        }
    }

    public PacketAddInt(value: number, bytes: number) {
        this.buffer.writeIntBE(value, this.offset, bytes);
        this.offset += bytes;
    }

    public PacketAddUInt(value: number, bytes: number): void {
        this.buffer.writeUIntBE(value, this.offset, bytes);
        this.offset += bytes;
    }

    public PacketAddString(str: string): void {
        const bytes = this.buffer.write(str, this.offset, undefined, this.coding);
        this.offset += bytes;
    }

    public PacketAddPString(str: string, strlenbytes: number): void {
        const bytes = this.buffer.write(str, this.offset + strlenbytes, undefined, this.coding);
        this.buffer.writeUIntBE(bytes, this.offset, strlenbytes);
        this.offset += (bytes + strlenbytes);
    }

    public PacketAddBuffer(buf: Buffer): void {
        buf.copy(this.buffer, this.offset, 0);
        this.offset += buf.length;
    }

    public PacketAddPBuffer(buf: Buffer, buflenbytes: number): void {
        this.PacketAddUInt(buf.length, buflenbytes);
        this.PacketAddBuffer(buf);
    }

    public ClearBuffer(): void {
        this.buffer.fill(0);
        this.offset = 0;
        if (this.headmode) {
            this.PacketAddUInt(0, HEAD_BYTE);
        }
    }

    public GetBuffer(): Buffer {
        if (this.headmode) {
            this.buffer.writeIntBE(this.offset - HEAD_BYTE, 0, HEAD_BYTE);
        }
        return this.buffer.slice(0, this.offset);
    }
}

export class BufferRecv {
    private buffer: Buffer;
    private offset: number = 0;
    private coding: string = 'utf8';

    constructor(buffer: Buffer, CODING?: string, head = false) {
        this.buffer = buffer;
        if (CODING) {
            this.coding = CODING;
        }
    }

    public UnPacketInt(bytes: number): number {
        const num = this.buffer.readIntBE(this.offset, bytes);
        this.offset += bytes;
        return num;
    }

    public UnPacketUInt(bytes: number): number {
        const num = this.buffer.readUIntBE(this.offset, bytes);
        this.offset += bytes;
        return num;
    }

    public UnPacketString(bytes?: number): string {
        if (bytes) {
            const str = this.buffer.toString(this.coding, this.offset, this.offset + bytes);
            this.offset += bytes;
            return str;
        } else {
            const str = this.buffer.toString(this.coding, this.offset);
            this.offset = this.buffer.length;
            return str;
        }
    }

    public UnPacketPString(strlenbytes: number): string {
        const len = this.UnPacketUInt(strlenbytes);
        return this.UnPacketString(len);
    }

    public UnPacketBuffer(bytes: number): Buffer {
        const end = Math.min(this.offset + bytes, this.buffer.length);
        const ret = this.buffer.slice(this.offset, end);
        this.offset = end;
        return ret;
    }

    public UnPacketPBuffer(buflenbytes: number): Buffer {
        const bytes = this.UnPacketUInt(buflenbytes);
        return this.UnPacketBuffer(bytes);
    }

    public GetBuffer(): Buffer {
        return this.buffer.slice(this.offset);
    }

    public BufferLength(): number {
        return this.buffer.length - this.offset;
    }

    public GetOriginBuffer(): Buffer {
        return this.buffer;
    }

    public OriginLength(): number {
        return this.buffer.length;
    }
}

export class BufferQueue {
    private buffer: Buffer = Buffer.alloc(1024 * 1024 * 10); // 10MB buffer queue
    private offset = 0;
    private offset2 = 0;
    private tmpbuffer: null | BufferRecv = null;

    public PacketAddBuffer(buf: Buffer): void {
        buf.copy(this.buffer, this.offset, 0);
        this.offset += buf.length;
    }

    public PacketAddUInt(value: number, bytes: number): void {
        this.buffer.writeUIntBE(value, this.offset, bytes);
        this.offset += bytes;
    }

    public UnPacketBuffer(bytes: number) {
        const end = Math.min(this.offset2 + bytes, this.buffer.length);
        const ret = this.buffer.slice(this.offset2, end);
        this.offset2 = end;
        return ret;
    }

    public UnPacketUInt(bytes: number): number {
        const num = this.buffer.readUIntBE(this.offset2, bytes);
        this.offset2 += bytes;
        return num;
    }

    public Reset() {
        this.offset = 0;
        this.offset2 = 0;
        this.tmpbuffer = null;
    }

    public Push(newbuf: Buffer) {
        if (this.tmpbuffer) {
            throw (new Error('tmpbuffer should be null when push new buffer'));
        }
        this.tmpbuffer = null;
        if (this.offset) {
            this.PacketAddBuffer(newbuf);
        } else {
            this.tmpbuffer = new BufferRecv(newbuf);
        }
    }

    public PopList(): Buffer[] {
        const list: Buffer[] = [];
        while (true) {
            const ret = this.Pop();
            if (ret) {
                list.push(ret);
            } else {
                break;
            }
        }
        return list;
    }

    public Pop(): null | Buffer {
        if (this.tmpbuffer) {
            if (this.offset) {
                throw (new Error('exist tmpbuffer, but buffer still contain data'));
            }
            const left = this.tmpbuffer.GetBuffer();
            if (left.length <= HEAD_BYTE) {
                this.PacketAddBuffer(left);
                this.tmpbuffer = null;
                return null;
            }
            const len = this.tmpbuffer.UnPacketUInt(HEAD_BYTE);
            if (this.tmpbuffer.GetBuffer().length >= len) {
                const ret = this.tmpbuffer.UnPacketBuffer(len);
                if (this.tmpbuffer.GetBuffer().length <= 0) {
                    this.tmpbuffer = null;
                }
                return ret;
            } else {
                this.PacketAddUInt(len, HEAD_BYTE);
                this.PacketAddBuffer(this.tmpbuffer.GetBuffer());
                this.tmpbuffer = null;
                return null;
            }
        } else {
            if (!this.offset) {
                return null;
            }
            const len = this.ReadUInt();
            if (this.offset - HEAD_BYTE - this.offset2 === len) {
                this.UnPacketUInt(HEAD_BYTE);
                const ret = this.UnPacketBuffer(len);
                this.Reset();
                return ret;
            } else if (this.offset - HEAD_BYTE - this.offset2 > len) {
                this.UnPacketUInt(HEAD_BYTE);
                return this.UnPacketBuffer(len);
            } else {
                return null;
            }
        }
    }

    private ReadUInt() {
        return this.buffer.readIntBE(this.offset2, HEAD_BYTE);
    }
}
