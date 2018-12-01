import { BufferSend, BufferRecv, HEAD_BYTE } from '../src/utils/bufferhelper';
describe('bufferhelper test', () => {
    const data1 = 12;
    const data2 = 13;
    const data3 = Buffer.from('abc');
    const data4 = 'efghijk';

    it('buffer send', () => {
        const send = new BufferSend(256, 'utf8', false);
        send.PacketAddInt(data1, 2); // 2bytes
        send.PacketAddUInt(data2, 4); // 4bytes
        send.PacketAddPBuffer(data3, 1); // 4bytes
        send.PacketAddPString(data4, 2); // 9bytes
        const buf = send.GetBuffer();
        expect(buf.length).toBe(19);
        send.ClearBuffer();
        expect(send.GetBuffer().length).toBe(0);
    });
    it('buffer recv', () => {

        const send = new BufferSend(256, 'utf8', true);
        send.PacketAddInt(data1, 2);
        send.PacketAddUInt(data2, 4);
        send.PacketAddPBuffer(data3, 1);
        send.PacketAddPString(data4, 2);
        const buf = send.GetBuffer();

        const recv = new BufferRecv(buf);
        expect(recv.OriginLength()).toBe(19 + HEAD_BYTE);
        expect(recv.UnPacketInt(2)).toBe(19);
        expect(recv.UnPacketInt(2)).toBe(data1);
        expect(recv.UnPacketUInt(4)).toBe(data2);
        expect(recv.UnPacketPBuffer(1)).toEqual(data3);
        expect(recv.UnPacketPString(2)).toBe(data4);
    });
});
