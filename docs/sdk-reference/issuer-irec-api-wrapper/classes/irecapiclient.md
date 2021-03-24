[@energyweb/issuer-irec-api-wrapper](../README.md) / [Exports](../modules.md) / IRECAPIClient

# Class: IRECAPIClient

## Hierarchy

* *EventEmitter*

  ↳ **IRECAPIClient**

## Table of contents

### Constructors

- [constructor](irecapiclient.md#constructor)

### Properties

- [axiosInstance](irecapiclient.md#axiosinstance)
- [config](irecapiclient.md#config)
- [interceptorId](irecapiclient.md#interceptorid)
- [captureRejectionSymbol](irecapiclient.md#capturerejectionsymbol)
- [captureRejections](irecapiclient.md#capturerejections)
- [defaultMaxListeners](irecapiclient.md#defaultmaxlisteners)
- [errorMonitor](irecapiclient.md#errormonitor)

### Accessors

- [account](irecapiclient.md#account)
- [device](irecapiclient.md#device)
- [file](irecapiclient.md#file)
- [fuel](irecapiclient.md#fuel)
- [issue](irecapiclient.md#issue)
- [organisation](irecapiclient.md#organisation)

### Methods

- [addListener](irecapiclient.md#addlistener)
- [applyTokens](irecapiclient.md#applytokens)
- [disableInterceptor](irecapiclient.md#disableinterceptor)
- [emit](irecapiclient.md#emit)
- [enableErrorHandler](irecapiclient.md#enableerrorhandler)
- [enableInterceptor](irecapiclient.md#enableinterceptor)
- [ensureNotExpired](irecapiclient.md#ensurenotexpired)
- [eventNames](irecapiclient.md#eventnames)
- [getMaxListeners](irecapiclient.md#getmaxlisteners)
- [listenerCount](irecapiclient.md#listenercount)
- [listeners](irecapiclient.md#listeners)
- [login](irecapiclient.md#login)
- [off](irecapiclient.md#off)
- [on](irecapiclient.md#on)
- [once](irecapiclient.md#once)
- [prependListener](irecapiclient.md#prependlistener)
- [prependOnceListener](irecapiclient.md#prependoncelistener)
- [rawListeners](irecapiclient.md#rawlisteners)
- [redeem](irecapiclient.md#redeem)
- [refreshAccessTokens](irecapiclient.md#refreshaccesstokens)
- [removeAllListeners](irecapiclient.md#removealllisteners)
- [removeListener](irecapiclient.md#removelistener)
- [setMaxListeners](irecapiclient.md#setmaxlisteners)
- [transfer](irecapiclient.md#transfer)
- [listenerCount](irecapiclient.md#listenercount)
- [on](irecapiclient.md#on)
- [once](irecapiclient.md#once)

## Constructors

### constructor

\+ **new IRECAPIClient**(`endPointUrl`: *string*, `accessTokens?`: [*AccessTokens*](../modules.md#accesstokens)): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`endPointUrl` | *string* |
`accessTokens?` | [*AccessTokens*](../modules.md#accesstokens) |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:43](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L43)

## Properties

### axiosInstance

• `Private` **axiosInstance**: AxiosInstance

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:43](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L43)

___

### config

• `Private` **config**: AxiosRequestConfig

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:39](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L39)

___

### interceptorId

• `Private` **interceptorId**: *number*

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:41](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L41)

___

### captureRejectionSymbol

▪ `Static` `Readonly` **captureRejectionSymbol**: *typeof* [*captureRejectionSymbol*](irecapiclient.md#capturerejectionsymbol)

Defined in: node_modules/@types/node/events.d.ts:35

___

### captureRejections

▪ `Static` **captureRejections**: *boolean*

Sets or gets the default captureRejection value for all emitters.

Defined in: node_modules/@types/node/events.d.ts:41

___

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: *number*

Defined in: node_modules/@types/node/events.d.ts:42

___

### errorMonitor

▪ `Static` `Readonly` **errorMonitor**: *typeof* [*errorMonitor*](irecapiclient.md#errormonitor)

This symbol shall be used to install a listener for only monitoring `'error'`
events. Listeners installed using this symbol are called before the regular
`'error'` listeners are called.

Installing a listener using this symbol does not change the behavior once an
`'error'` event is emitted, therefore the process will still crash if no
regular `'error'` listener is installed.

Defined in: node_modules/@types/node/events.d.ts:34

## Accessors

### account

• get **account**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`get` | (`code`: *string*) => *Promise*<[*Account*](account.md)\> |
`getAll` | () => *Promise*<[*Account*](account.md)[]\> |
`getBalance` | (`code`: *string*) => *Promise*<[*AccountBalance*](accountbalance.md)[]\> |
`getItems` | (`code`: *string*) => *Promise*<[*AccountItem*](accountitem.md)[]\> |
`getTransactions` | (`code`: *string*) => *Promise*<([*Transaction*](transaction.md) \| [*RedeemTransaction*](redeemtransaction.md))[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:91](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L91)

___

### device

• get **device**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`approve` | (`code`: *string*, `\_\_namedParameters`: { `fileIds?`: *string*[] ; `notes?`: *string*  }) => *Promise*<void\> |
`create` | (`device`: [*DeviceCreateParams*](devicecreateparams.md)) => *Promise*<[*Device*](device.md)\> |
`edit` | (`code`: *string*, `device`: *Partial*<[*DeviceUpdateParams*](deviceupdateparams.md)\>) => *Promise*<[*Device*](device.md)\> |
`get` | (`code`: *string*) => *Promise*<[*Device*](device.md)\> |
`getAll` | () => *Promise*<[*Device*](device.md)[]\> |
`refer` | (`code`: *string*, `\_\_namedParameters`: { `fileIds?`: *string*[] ; `notes?`: *string*  }) => *Promise*<void\> |
`reject` | (`code`: *string*, `\_\_namedParameters`: { `fileIds?`: *string*[] ; `notes?`: *string*  }) => *Promise*<void\> |
`submit` | (`code`: *string*, `\_\_namedParameters`: { `fileIds?`: *string*[] ; `notes?`: *string*  }) => *Promise*<void\> |
`verify` | (`code`: *string*, `\_\_namedParameters`: { `fileIds?`: *string*[] ; `notes?`: *string*  }) => *Promise*<void\> |
`withdraw` | (`code`: *string*, `\_\_namedParameters`: { `notes?`: *string*  }) => *Promise*<void\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:269](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L269)

___

### file

• get **file**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`download` | (`code`: *string*) => *Promise*<string\> |
`upload` | (`files`: Blob[] \| *ReadStream*[]) => *Promise*<string[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:242](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L242)

___

### fuel

• get **fuel**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`getAll` | () => *Promise*<[*Fuel*](fuel.md)[]\> |
`getAllTypes` | () => *Promise*<[*FuelType*](fueltype.md)[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:381](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L381)

___

### issue

• get **issue**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`approve` | (`code`: *string*, `approve`: [*ApproveIssue*](approveissue.md)) => *Promise*<void\> |
`create` | (`issue`: [*Issue*](issue.md)) => *Promise*<string\> |
`get` | (`code`: *string*) => *Promise*<[*IssueWithStatus*](issuewithstatus.md)\> |
`getStatus` | (`code`: *string*) => *Promise*<[*IssueWithStatus*](issuewithstatus.md)\> |
`refer` | (`code`: *string*, `notes?`: *string*) => *Promise*<void\> |
`reject` | (`code`: *string*, `notes?`: *string*) => *Promise*<void\> |
`submit` | (`code`: *string*, `notes?`: *string*) => *Promise*<void\> |
`update` | (`code`: *string*, `issue`: [*Issue*](issue.md)) => *Promise*<void\> |
`verify` | (`code`: *string*, `notes?`: *string*) => *Promise*<void\> |
`withdraw` | (`code`: *string*, `notes?`: *string*) => *Promise*<void\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:173](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L173)

___

### organisation

• get **organisation**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`get` | () => *Promise*<[*Organisation*](organisation.md)\> |
`getIssuers` | () => *Promise*<[*CodeName*](codename.md)[]\> |
`getRegistrants` | () => *Promise*<[*CodeName*](codename.md)[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:142](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L142)

## Methods

### addListener

▸ **addListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:636

___

### applyTokens

▸ `Private`**applyTokens**(`accessToken`: *string*, `refreshToken`: *string*, `expiresIn`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`accessToken` | *string* |
`refreshToken` | *string* |
`expiresIn` | *number* |

**Returns:** *void*

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:428](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L428)

___

### disableInterceptor

▸ `Private`**disableInterceptor**(): *void*

**Returns:** *void*

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:491](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L491)

___

### emit

▸ **emit**(`event`: *string* \| *symbol*, ...`args`: *any*[]): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`...args` | *any*[] |

**Returns:** *boolean*

Defined in: node_modules/@types/node/globals.d.ts:646

___

### enableErrorHandler

▸ `Private`**enableErrorHandler**(): *void*

**Returns:** *void*

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:500](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L500)

___

### enableInterceptor

▸ `Private`**enableInterceptor**(): *void*

**Returns:** *void*

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:478](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L478)

___

### ensureNotExpired

▸ `Private`**ensureNotExpired**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:469](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L469)

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

**Returns:** (*string* \| *symbol*)[]

Defined in: node_modules/@types/node/globals.d.ts:651

___

### getMaxListeners

▸ **getMaxListeners**(): *number*

**Returns:** *number*

Defined in: node_modules/@types/node/globals.d.ts:643

___

### listenerCount

▸ **listenerCount**(`type`: *string* \| *symbol*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* \| *symbol* |

**Returns:** *number*

Defined in: node_modules/@types/node/globals.d.ts:647

___

### listeners

▸ **listeners**(`event`: *string* \| *symbol*): Function[]

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** Function[]

Defined in: node_modules/@types/node/globals.d.ts:644

___

### login

▸ **login**(`userName`: *string*, `password`: *string*, `clientId`: *string*, `clientSecret`: *string*): *Promise*<[*AccessTokens*](../modules.md#accesstokens)\>

#### Parameters:

Name | Type |
:------ | :------ |
`userName` | *string* |
`password` | *string* |
`clientId` | *string* |
`clientSecret` | *string* |

**Returns:** *Promise*<[*AccessTokens*](../modules.md#accesstokens)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:56](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L56)

___

### off

▸ **off**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:640

___

### on

▸ **on**(`event`: *tokensRefreshed*, `listener`: (`accessTokens`: [*AccessTokens*](../modules.md#accesstokens)) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *tokensRefreshed* |
`listener` | (`accessTokens`: [*AccessTokens*](../modules.md#accesstokens)) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:35](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L35)

___

### once

▸ **once**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:638

___

### prependListener

▸ **prependListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:649

___

### prependOnceListener

▸ **prependOnceListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:650

___

### rawListeners

▸ **rawListeners**(`event`: *string* \| *symbol*): Function[]

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** Function[]

Defined in: node_modules/@types/node/globals.d.ts:645

___

### redeem

▸ **redeem**(`redemption`: [*Redemption*](redemption.md)): *Promise*<[*RedeemTransactionResult*](redeemtransactionresult.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`redemption` | [*Redemption*](redemption.md) |

**Returns:** *Promise*<[*RedeemTransactionResult*](redeemtransactionresult.md)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:414](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L414)

___

### refreshAccessTokens

▸ `Private`**refreshAccessTokens**(): *Promise*<[*AccessTokens*](../modules.md#accesstokens)\>

**Returns:** *Promise*<[*AccessTokens*](../modules.md#accesstokens)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:442](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L442)

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:641

___

### removeListener

▸ **removeListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:639

___

### setMaxListeners

▸ **setMaxListeners**(`n`: *number*): [*IRECAPIClient*](irecapiclient.md)

#### Parameters:

Name | Type |
:------ | :------ |
`n` | *number* |

**Returns:** [*IRECAPIClient*](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:642

___

### transfer

▸ **transfer**(`transfer`: [*Transfer*](transfer.md)): *Promise*<[*TransactionResult*](transactionresult.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`transfer` | [*Transfer*](transfer.md) |

**Returns:** *Promise*<[*TransactionResult*](transactionresult.md)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:400](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L400)

___

### listenerCount

▸ `Static`**listenerCount**(`emitter`: *EventEmitter*, `event`: *string* \| *symbol*): *number*

**`deprecated`** since v4.0.0

#### Parameters:

Name | Type |
:------ | :------ |
`emitter` | *EventEmitter* |
`event` | *string* \| *symbol* |

**Returns:** *number*

Defined in: node_modules/@types/node/events.d.ts:23

___

### on

▸ `Static`**on**(`emitter`: *EventEmitter*, `event`: *string*): *AsyncIterableIterator*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`emitter` | *EventEmitter* |
`event` | *string* |

**Returns:** *AsyncIterableIterator*<any\>

Defined in: node_modules/@types/node/events.d.ts:20

___

### once

▸ `Static`**once**(`emitter`: *NodeEventTarget*, `event`: *string* \| *symbol*): *Promise*<any[]\>

#### Parameters:

Name | Type |
:------ | :------ |
`emitter` | *NodeEventTarget* |
`event` | *string* \| *symbol* |

**Returns:** *Promise*<any[]\>

Defined in: node_modules/@types/node/events.d.ts:18

▸ `Static`**once**(`emitter`: DOMEventTarget, `event`: *string*): *Promise*<any[]\>

#### Parameters:

Name | Type |
:------ | :------ |
`emitter` | DOMEventTarget |
`event` | *string* |

**Returns:** *Promise*<any[]\>

Defined in: node_modules/@types/node/events.d.ts:19
