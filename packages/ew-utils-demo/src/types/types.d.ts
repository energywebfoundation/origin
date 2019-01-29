// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as us from 'underscore';

export declare class BN {
  static isBN(val: any): boolean;
  clone(): BN;
  toString(base?: number, length?: number): string;
  toNumber(): number;
  toJSON(): string;
  toArray(endian?, length?: number);
  toArrayLike(type, endian?, length?);
  toBuffer(endian?, length?: number);
  /**  get number of bits occupied  */
  bitLength(): number;
  /**  return number of less-significant consequent zero bits (example: 1010000 has 4 zero bits) */
  zeroBits(): number;
  /** true if the number is negative */
  isNeg(): boolean;
  isEven(): boolean;
  isOdd(): boolean;
  isZero(): boolean;
  cmp(b: BN): number;
  lt(b: BN): number;
  lte(b: BN): number;
  gt(b: BN): number;
  gte(b: BN): number;
  eq(b: BN): number;
  toTwos(width: number): BN;
  fromTwos(width: number): BN;

  neg(): BN;
  abs(): BN;
  add(b: BN): BN;
  sub(b: BN): BN;
  mul(b: BN): BN;
  div(b: BN): BN;
  divRound(b: BN): BN;
  mod(b: BN): BN;
  sqr(): BN;

  or(b: BN): BN;
  and(b: BN): BN;
  xor(b: BN): BN;
  setn(b: number, val: boolean): BN;
  shln(b: number): BN;
  shrn(b: number): BN;
  testn(b: number): boolean;
  maskn(b: number): BN;
  bincn(b: number): BN;
  notn(w: number): BN;

}

// '{"jsonrpc":"2.0","method":"eth_sendTransaction","params":[{see above}],"id":1}'
export declare interface JsonRPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}
export declare interface JsonRPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: string;
}

type Callback<T> = (error: Error, result: T) => void;
type ABIDataTypes = 'uint256' | 'boolean' | 'string' | 'bytes' | string; // TODO complete list
export declare interface Provider {
  send(payload: JsonRPCRequest | JsonRPCRequest[], callback: (e: Error, val: JsonRPCResponse | JsonRPCResponse[]) => void);
}
type PromiEventType = 'transactionHash' | 'receipt' | 'confirmation' | 'error';
export declare interface PromiEvent<T> extends Promise<T> {
  once(type: 'transactionHash', handler: (receipt: string) => void): PromiEvent<T>;
  once(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>;
  once(type: 'confirmation', handler: (confNumber: number, receipt: TransactionReceipt) => void): PromiEvent<T>;
  once(type: 'error', handler: (error: Error) => void): PromiEvent<T>;
  once(type: 'error' | 'confirmation' | 'receipt' | 'transactionHash', handler: (error: Error | TransactionReceipt | string) => void): PromiEvent<T>;
  on(type: 'transactionHash', handler: (receipt: string) => void): PromiEvent<T>;
  on(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>;
  on(type: 'confirmation', handler: (confNumber: number, receipt: TransactionReceipt) => void): PromiEvent<T>;
  on(type: 'error', handler: (error: Error) => void): PromiEvent<T>;
  on(type: 'error' | 'confirmation' | 'receipt' | 'transactionHash', handler: (error: Error | TransactionReceipt | string) => void): PromiEvent<T>;
}
export declare interface EventEmitter<V= any> {
  on(type: 'data', handler: (event: EventLog<V>) => void): EventEmitter<V>;
  on(type: 'changed', handler: (receipt: EventLog<V>) => void): EventEmitter<V>;
  on(type: 'error', handler: (error: Error) => void): EventEmitter<V>;
  on(type: 'error' | 'data' | 'changed', handler: (error: Error | TransactionReceipt | string) => void): EventEmitter<V>;
}

export declare interface TransactionObject<T> {
  arguments: any[];
  call(tx?: Tx): Promise<T>;
  send(tx?: Tx): PromiEvent<T>;
  estimateGas(tx?: Tx): Promise<number>;
  encodeABI(): string;
}

export declare interface ABIDefinition {
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
  inputs?: Array<{ name: string, type: ABIDataTypes, indexed?: boolean }>;
  name?: string;
  outputs?: Array<{ name: string, type: ABIDataTypes }>;
  type: 'function' | 'constructor' | 'event' | 'fallback';
}
export declare interface CompileResult {
  code: string;
  info: {
    source: string
    language: string
    languageVersion: string
    compilerVersion: string
    abiDefinition: ABIDefinition[],
  };
  userDoc: { methods: object };
  developerDoc: { methods: object };

}
export declare interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: number;
  input: string;
  v?: string;
  r?: string;
  s?: string;
}
export declare interface EventLog<V= any> {
  event: string;
  address: string;
  returnValues: V;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  raw?: { data: string, topics: any[] };
}
export declare interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  logs?: Log[];
  events?: {
    [eventName: string]: EventLog<any>,
  };
}
export declare interface BlockHeader {
  number: number;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionRoot: string;
  stateRoot: string;
  receiptRoot: string;
  miner: string;
  extraData: string;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
}
export declare interface Block extends BlockHeader {
  transactions: Transaction[];
  size: number;
  difficulty: number;
  totalDifficulty: number;
  uncles: string[];
}
export declare interface Logs {
  fromBlock?: number;
  address?: string;
  topics?: Array<string | string[]>;
  toBlock?: number;

}
export declare interface Log {
  address: string;
  data: string;
  topics: string[];
  logIndex: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;

}
export declare interface Subscribe<T> {
  subscription: {
    id: string
    arguments: object
    subscribe(callback?: Callback<Subscribe<T>>): Subscribe<T>
    unsubscribe(callback?: Callback<boolean>): void | boolean,
  };
  /*  on(type: "data" , handler:(data:Transaction)=>void): void
    on(type: "changed" , handler:(data:Logs)=>void): void
    on(type: "error" , handler:(data:Error)=>void): void
    on(type: "block" , handler:(data:BlockHeader)=>void): void
    */
  on(type: 'data', handler: (data: T) => void): void;
  on(type: 'changed', handler: (data: T) => void): void;
  on(type: 'error', handler: (data: Error) => void): void;
}
export declare interface Account {
  address: string;
  privateKey: string;
  publicKey: string;

}
export declare interface PrivateKey {
  /**
   * the public address of the key
   * example: 008aeeda4d805471df9b2a5b0f38a0c3bcba786b
   */
  address?: string; // hexWithout
  /**
   * the crypt-parameters
   */
  crypto: {
    /**
     * the cipher algorithm
     */
    cipher: 'aes-128-ctr'
    /**
     * seed-value
     * example: 5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46
     */
    ciphertext: string // hexWithout
    /**
     * params for the cipher
     */
    cipherparams: {
      /**
       * 128-bit initialisation vector for the cipher.
       * example: 6087dab2f9fdbbfaddc31a909735c1e6
       */
      iv: string, // hexWithout
    }
    /**
     * kdf-type
     */
    kdf: 'scrypt' | 'pbkdf2'
    /**
     * params for the kdf
     */
    kdfparams: {
      /**
       * number of iterations
       */
      c?: number
      /**
       * length for the derived key. Must be >= 32.
       * example: 32
       */
      dklen: number
      /**
       * Must be hmac-sha256 (may be extended in the future)
       */
      prf?: 'hmac-sha256'
      /**
       * random salt
       * example: ab0c7876052600dd703518d6fc3fe8984592145b591fc8fb5c6d43190334ba19
       */
      salt: string // hexWithout
      /**
       * for scrypt - General work factor, iteration count
       * example: 262144
       */
      n?: number
      /**
       * for scrypt -  blocksize in use for underlying hash, fine-tunes the relative memory-cost.
       * example: 1
       */
      r?: number
      /**
       * for scrypt - parallelization factor, fine-tunes the relative cpu-cost.
       * example: 8
       */
      p?: number,
    }
    /**
     * The MAC should be calculated as the SHA3 (keccak-256) hash of the byte array formed as the concatenations of the second-leftmost 16 bytes of the derived key with the ciphertext keys contents, i.e. KECCAK(DK[16..31] ++ <ciphertext>)
     * example: 2103ac29920d71da29f15d75b4a16dbe95cfd7ff8faea1056c33131d846e3097
     */
    mac: string, // hexWithout
  };
  /**
   * internal id
   * example: 3198bc9c-6672-5ab3-d995-4942343ae5b6
   */
  id: string; // uuid
  /**
   * keyfile-version
   * example: 3
   */
  version: number;
}

export declare interface Signature {
  message: string;
  messageHash: string;
  r: string;
  s: string;
  v: string;
}
export declare interface Tx {
  nonce?: string | number;
  chainId?: string | number;
  from?: string;
  to?: string;
  data?: string;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
  privateKey?: string;

}
export declare interface WebsocketProvider extends Provider { }
export declare interface HttpProvider extends Provider { }
export declare interface IpcProvider extends Provider { }
type Unit = 'kwei' | 'femtoether' | 'babbage' | 'mwei' | 'picoether' | 'lovelace' | 'qwei' | 'nanoether' | 'shannon' | 'microether' | 'szabo' | 'nano' | 'micro' | 'milliether' | 'finney' | 'milli' | 'ether' | 'kether' | 'grand' | 'mether' | 'gether' | 'tether';
export type BlockType = 'latest' | 'pending' | 'genesis' | number;
export declare interface Iban { }
export declare interface Utils {
  BN: BN; // TODO only static-definition
  _: us.UnderscoreStatic;
  unitMap: any;
  isBN(any): boolean;
  isBigNumber(any): boolean;
  isAddress(any): boolean;
  isHex(any): boolean;
  asciiToHex(val: string): string;
  hexToAscii(val: string): string;
  bytesToHex(val: number[]): string;
  numberToHex(val: number | BN): string;
  checkAddressChecksum(address: string): boolean;
  fromAscii(val: string): string;
  fromDecimal(val: string | number | BN): string;
  fromUtf8(val: string): string;
  fromWei(val: string | number | BN, unit: Unit): string | BN;
  hexToBytes(val: string): number[];
  hexToNumber(val: string | number | BN): number;
  hexToNumberString(val: string | number | BN): string;
  hexToString(val: string): string;
  hexToUtf8(val: string): string;
  keccak256(val: string): string;
  leftPad(string: string, chars: number, sign: string): string;
  padLeft(string: string, chars: number, sign: string): string;
  rightPad(string: string, chars: number, sign: string): string;
  padRight(string: string, chars: number, sign: string): string;
  sha3(val: string, val2?: string, val3?: string, val4?: string, val5?: string): string;
  soliditySha3(val: string): string;
  randomHex(bytes: number): string;
  stringToHex(val: string): string;
  toAscii(hex: string): string;
  toBN(any): BN;
  toChecksumAddress(val: string): string;
  toDecimal(val: any): number;
  toHex(val: any): string;
  toUtf8(val: any): string;
  toWei(val: string | number | BN, unit: Unit): string | BN;
}
export declare interface Contract {
  options: {
    address: string
    jsonInterface: ABIDefinition[],
  };
  methods: {
    [fnName: string]: (...args) => TransactionObject<any>,
  };
  events: {
    [eventName: string]: (options?: {
      filter?: object
      fromBlock?: BlockType
      topics?: any[],
    }, cb?: Callback<EventLog<any>>) => EventEmitter<any>
    allEvents: (options?: { filter?: object, fromBlock?: BlockType, topics?: any[] }, cb?: Callback<EventLog<any>>) => EventEmitter<any>,
  };
  deploy(options: {
    data: string
    arguments: any[],
  }): TransactionObject<Contract>;

}
export declare interface Request { }
export declare interface Providers {
  WebsocketProvider: new (host: string, timeout?: number) => WebsocketProvider;
  HttpProvider: new (host: string, timeout?: number) => HttpProvider;
  IpcProvider: new (path: string, net: any) => IpcProvider;
}

export declare class Eth {
  defaultAccount: string;
  defaultBlock: BlockType;
  BatchRequest: new () => BatchRequest;
  Iban: new (address: string) => Iban;
  Contract: new (jsonInterface: any[], address?: string, options?: {
    from?: string
    gas?: string | number | BN
    gasPrice?: number
    data?: string,
  }) => Contract;
  abi: {
    decodeLog(inputs: object, hexString: string, topics: string[]): object
    encodeParameter(type: string, parameter: any): string
    encodeParameters(types: string[], paramaters: any[]): string
    encodeEventSignature(name: string | object): string
    encodeFunctionCall(jsonInterface: object, parameters: any[]): string
    encodeFunctionSignature(name: string | object): string
    decodeParameter(type: string, hex: string): any
    decodeParameters(types: string[], hex: string): any,
  };
  accounts: {
    wallet: {
      'new'(numberOfAccounts: number, entropy: string): Account[]
      add(account: string | Account): any
      remove(account: string | number): any
      save(password: string, keyname?: string): string
      load(password: string, keyname: string): any
      clear(): any,
    }
    hashMessage(data: any): string
    create(entropy?: string): Account
    privateKeyToAccount(privKey: string): Account
    publicToAddress(key: string): string
    signTransaction(tx: Tx, privateKey: string, returnSignature?: boolean, cb?: (err: Error, result: string | Signature) => void): Promise<string> | Signature
    recoverTransaction(signature: string | Signature): string
    sign(data: string, privateKey: string, returnSignature?: boolean): string | Signature
    recover(signature: string | Signature): string
    encrypt(privateKey: string, password: string): PrivateKey
    decrypt(privateKey: PrivateKey, password: string): Account,
  };
  compile: {
    solidity(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>
    lll(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>
    serpent(source: string, callback?: Callback<CompileResult>): Promise<CompileResult>,
  };
  currentProvider: Provider;
  givenProvider: Provider;
  net: Net;
  personal: Personal;
  call(callObject: Tx, defaultBloc?: BlockType, callBack?: Callback<string>): Promise<string>;
  clearSubscriptions(): boolean;
  subscribe(type: 'logs', options?: Logs, callback?: Callback<Subscribe<Log>>): Subscribe<Log>;
  subscribe(type: 'syncing', callback?: Callback<Subscribe<any>>): Subscribe<any>;
  subscribe(type: 'newBlockHeaders', callback?: Callback<Subscribe<BlockHeader>>): Subscribe<BlockHeader>;
  subscribe(type: 'pendingTransactions', callback?: Callback<Subscribe<Transaction>>): Subscribe<Transaction>;
  subscribe(type: 'pendingTransactions' | 'newBlockHeaders' | 'syncing' | 'logs', options?: Logs, callback?: Callback<Subscribe<Transaction | BlockHeader | any>>): Subscribe<Transaction | BlockHeader | any>;

  unsubscribe(callBack: Callback<boolean>): void | boolean;
  estimateGas(tx: Tx, callback?: Callback<number>): Promise<number>;
  getAccounts(cb?: Callback<string[]>): Promise<string[]>;
  getBalance(address: string, defaultBlock?: BlockType, cb?: Callback<number>): Promise<number>;
  getBlock(number: BlockType, returnTransactionObjects?: boolean, cb?: Callback<Block>): Promise<Block>;
  getBlockNumber(callback?: Callback<number>): Promise<number>;
  getBlockTransactionCount(number: BlockType | string, cb?: Callback<number>): Promise<number>;
  getBlockUncleCount(number: BlockType | string, cb?: Callback<number>): Promise<number>;
  getCode(address: string, defaultBlock?: BlockType, cb?: Callback<string>): Promise<string>;
  getCoinbase(cb?: Callback<string>): Promise<string>;
  getCompilers(cb?: Callback<string[]>): Promise<string[]>;
  getGasPrice(cb?: Callback<number>): Promise<number>;
  getHashrate(cb?: Callback<number>): Promise<number>;
  getPastLogs(options: {
    fromBlock?: BlockType
    toBlock?: BlockType
    address: string
    topics?: Array<string | string[]>,
  }, cb?: Callback<Log[]>): Promise<Log[]>;
  getProtocolVersion(cb?: Callback<string>): Promise<string>;
  getStorageAt(address: string, defaultBlock?: BlockType, cb?: Callback<string>): Promise<string>;
  getTransactionReceipt(hash: string, cb?: Callback<TransactionReceipt>): Promise<TransactionReceipt>;
  getTransaction(hash: string, cb?: Callback<Transaction>): Promise<Transaction>;
  getTransactionCount(address: string, defaultBlock?: BlockType, cb?: Callback<number>): Promise<number>;
  getTransactionFromBlock(block: BlockType, index: number, cb?: Callback<Transaction>): Promise<Transaction>;
  getUncle(blockHashOrBlockNumber: BlockType | string, uncleIndex: number, returnTransactionObjects?: boolean, cb?: Callback<Block>): Promise<Block>;
  getWork(cb?: Callback<string[]>): Promise<string[]>;
  isMining(cb?: Callback<boolean>): Promise<boolean>;
  isSyncing(cb?: Callback<boolean>): Promise<boolean>;
  sendSignedTransaction(data: string, cb?: Callback<string>): PromiEvent<TransactionReceipt>;
  sendTransaction(tx: Tx, cb?: Callback<string>): PromiEvent<TransactionReceipt>;
  submitWork(nonce: string, powHash: string, digest: string, cb?: Callback<boolean>): Promise<boolean>;
  sign(address: string, dataToSign: string, cb?: Callback<string>): Promise<string>;

}
export declare class Net {
  getId(cb?: Callback<boolean>): Promise<number>;
}
export declare class Personal {
  newAccount(password: string, cb?: Callback<boolean>): Promise<boolean>;
  getAccounts(cb?: Callback<string[]>): Promise<string[]>;
  importRawKey();
  lockAccount();
  unlockAccount();
  sign();
}
export declare class Shh { }
export declare class Bzz { }
export declare class BatchRequest {
  constructor()
  add(request: Request): void; //
  execute(): void;
}
