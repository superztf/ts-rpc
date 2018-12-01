
[![Build Status](https://travis-ci.org/superztf/ts-rpc.svg?branch=master)](https://travis-ci.org/superztf/ts-rpc)
[![npm version](https://badge.fury.io/js/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![npm](https://img.shields.io/npm/dt/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![NpmLicense](https://img.shields.io/npm/l/ts-rpc-node.svg)](https://www.npmjs.com/package/ts-rpc-node)
[![Coverage Status](https://coveralls.io/repos/github/superztf/ts-rpc/badge.svg?branch=master)](https://coveralls.io/github/superztf/ts-rpc?branch=master)


# ts-rpc

readme is under editing...
* npm i ts-rpc-node
* [source code](https://github.com/superztf/ts-rpc)
* See src/test for typescript example
* See bin/test for javascript example


# Concept
## Notice
## Request
## Response

## simplerpc()
Wrapper of RPC function

Possible signatures:
* <code>simplerpc(rpcFunc)</code>
* <code>simplerpc(options,rpcFunc)</code>

### simplerpc(options,rpcFunc)
Parameters:
* <code>options</code> <span class="method-type">&laquo;Object&raquo;</span> Supports the following properties:
    * <code>service</code> <span class="method-type">&laquo;string|string[]&raquo;</span> The target service's name.This name is the unique identifier for each service.Giving a string array means the rpc will be broadcast to these services as a notice.

Returns:
* Function

