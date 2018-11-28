export class Emptylogger {

    // tslint:disable-next-line:no-empty
    public static info(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static debug(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static error(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static assert(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static trace(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static warn(...args: any[]) { }
    // tslint:disable-next-line:no-empty
    public static table(...args: any[]) { }
    public level: any;
    public config: any;
}

const RANDOM_LEN = 1000;

export function encryptkey(key: string, token: string, randomkey?: number): number {
    let value = 0;
    let i = 0;
    let tokenvalue = 0;
    for (const c of token) {
        i += 1;
        const code = c.charCodeAt(0);
        if (code < 58) {
            value += code % i + code % 10 + code % 33 + code;
        } else {
            value += Math.ceil(code / 3) + i;
        }
        tokenvalue += Math.max(code % token.length, code - token.length);
    }
    i = 0;
    for (const c of key) {
        i += 1;
        const code = c.charCodeAt(0);
        if (code > 68) {
            value += code % i + code % 15 + code % 28 + code;
        } else {
            value += Math.ceil(code / 2) + Math.min(i, code);
        }
    }
    if (!randomkey) {
        randomkey = Math.floor(Math.random() * RANDOM_LEN);
    }
    value += (Math.ceil(randomkey / 3)) ** 2 + tokenvalue + (key.length + token.length) * randomkey;
    value *= RANDOM_LEN;
    value += randomkey;
    return value;
}

export function checkkey(key: string, token: string, value: number): boolean {
    const randomkey = value % RANDOM_LEN;
    const v1 = encryptkey(key, token, randomkey);
    return value === v1;
}
