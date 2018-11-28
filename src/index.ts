import { simplerpc, promirpc, createClient, createClientSync } from './client/index';
import { createProxy } from './server/index';

export {
    // client api
    createClient,
    createClientSync,
    simplerpc,
    promirpc,
    // server api
    createProxy,
};
