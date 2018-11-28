export function prints(...args: any[]) {
    // tslint:disable-next-line:no-console
    console.log('[test message]', ...args);
}

export class MyMethod3 {
    public m3foo1(n: number, next: (err: any, ret: string) => void) {
        prints('m3foo1 called', n);
        if (n >= 0) {
            next(null, `i am ${n} years old`);
        } else {
            next({ err: 'n should be bigger than 0' }, '');
        }
    }
}

export class MyMethod2 {
    public m2foo1(msg: string) {
        prints('m2foo1 called', msg);
    }

    public m2foo2(key: number, next: Function) {
        prints('m2foo2 called, i will do next to back');
        return next(key + 1);
    }
}

export class MyMethod1 {
    public method2 = new MyMethod2();
    public method3 = new MyMethod3();

    public m1foo1(arg1: number, arg2: any) {
        prints('m1foo1 called', arg1, arg2);
    }

    public m1foo2() {
        prints('m1foo2 called');
    }
}
