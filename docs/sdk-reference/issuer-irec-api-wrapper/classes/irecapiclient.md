[@energyweb/issuer-irec-api-wrapper](../README.md) / [Exports](../modules.md) / IRECAPIClient

# Class: IRECAPIClient

## Hierarchy

-   _EventEmitter_

    ↳ **IRECAPIClient**

## Table of contents

### Constructors

-   [constructor](irecapiclient.md#constructor)

### Properties

-   [axiosInstance](irecapiclient.md#axiosinstance)
-   [config](irecapiclient.md#config)
-   [interceptorId](irecapiclient.md#interceptorid)
-   [captureRejectionSymbol](irecapiclient.md#capturerejectionsymbol)
-   [captureRejections](irecapiclient.md#capturerejections)
-   [defaultMaxListeners](irecapiclient.md#defaultmaxlisteners)
-   [errorMonitor](irecapiclient.md#errormonitor)

### Accessors

-   [account](irecapiclient.md#account)
-   [device](irecapiclient.md#device)
-   [file](irecapiclient.md#file)
-   [fuel](irecapiclient.md#fuel)
-   [issue](irecapiclient.md#issue)
-   [organisation](irecapiclient.md#organisation)

### Methods

-   [addListener](irecapiclient.md#addlistener)
-   [applyTokens](irecapiclient.md#applytokens)
-   [disableInterceptor](irecapiclient.md#disableinterceptor)
-   [emit](irecapiclient.md#emit)
-   [enableErrorHandler](irecapiclient.md#enableerrorhandler)
-   [enableInterceptor](irecapiclient.md#enableinterceptor)
-   [ensureNotExpired](irecapiclient.md#ensurenotexpired)
-   [eventNames](irecapiclient.md#eventnames)
-   [getMaxListeners](irecapiclient.md#getmaxlisteners)
-   [listenerCount](irecapiclient.md#listenercount)
-   [listeners](irecapiclient.md#listeners)
-   [login](irecapiclient.md#login)
-   [off](irecapiclient.md#off)
-   [on](irecapiclient.md#on)
-   [once](irecapiclient.md#once)
-   [prependListener](irecapiclient.md#prependlistener)
-   [prependOnceListener](irecapiclient.md#prependoncelistener)
-   [rawListeners](irecapiclient.md#rawlisteners)
-   [redeem](irecapiclient.md#redeem)
-   [refreshAccessTokens](irecapiclient.md#refreshaccesstokens)
-   [removeAllListeners](irecapiclient.md#removealllisteners)
-   [removeListener](irecapiclient.md#removelistener)
-   [setMaxListeners](irecapiclient.md#setmaxlisteners)
-   [transfer](irecapiclient.md#transfer)
-   [listenerCount](irecapiclient.md#listenercount)
-   [on](irecapiclient.md#on)
-   [once](irecapiclient.md#once)

## Constructors

### constructor

\+ **new IRECAPIClient**(`endPointUrl`: _string_, `accessTokens?`: [_AccessTokens_](../modules.md#accesstokens)): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name            | Type                                         |
| :-------------- | :------------------------------------------- |
| `endPointUrl`   | _string_                                     |
| `accessTokens?` | [_AccessTokens_](../modules.md#accesstokens) |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:43](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L43)

## Properties

### axiosInstance

• `Private` **axiosInstance**: AxiosInstance

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:43](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L43)

---

### config

• `Private` **config**: AxiosRequestConfig

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:39](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L39)

---

### interceptorId

• `Private` **interceptorId**: _number_

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:41](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L41)

---

### captureRejectionSymbol

▪ `Static` `Readonly` **captureRejectionSymbol**: _typeof_ [_captureRejectionSymbol_](irecapiclient.md#capturerejectionsymbol)

Defined in: node_modules/@types/node/events.d.ts:35

---

### captureRejections

▪ `Static` **captureRejections**: _boolean_

Sets or gets the default captureRejection value for all emitters.

Defined in: node_modules/@types/node/events.d.ts:41

---

### defaultMaxListeners

▪ `Static` **defaultMaxListeners**: _number_

Defined in: node_modules/@types/node/events.d.ts:42

---

### errorMonitor

▪ `Static` `Readonly` **errorMonitor**: _typeof_ [_errorMonitor_](irecapiclient.md#errormonitor)

This symbol shall be used to install a listener for only monitoring `'error'`
events. Listeners installed using this symbol are called before the regular
`'error'` listeners are called.

Installing a listener using this symbol does not change the behavior once an
`'error'` event is emitted, therefore the process will still crash if no
regular `'error'` listener is installed.

Defined in: node_modules/@types/node/events.d.ts:34

## Accessors

### account

• get **account**(): _object_

**Returns:** _object_

| Name              | Type                                                                                                                 |
| :---------------- | :------------------------------------------------------------------------------------------------------------------- |
| `get`             | (`code`: _string_) => _Promise_<[_Account_](account.md)\>                                                            |
| `getAll`          | () => _Promise_<[_Account_](account.md)[]\>                                                                          |
| `getBalance`      | (`code`: _string_) => _Promise_<[_AccountBalance_](accountbalance.md)[]\>                                            |
| `getItems`        | (`code`: _string_) => _Promise_<[_AccountItem_](accountitem.md)[]\>                                                  |
| `getTransactions` | (`code`: _string_) => _Promise_<([_Transaction_](transaction.md) \| [_RedeemTransaction_](redeemtransaction.md))[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:91](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L91)

---

### device

• get **device**(): _object_

**Returns:** _object_

| Name       | Type                                                                                                                         |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `approve`  | (`code`: _string_, `\_\_namedParameters`: { `fileIds?`: _string_[] ; `notes?`: _string_ }) => _Promise_<void\>               |
| `create`   | (`device`: [_DeviceCreateParams_](devicecreateparams.md)) => _Promise_<[_Device_](device.md)\>                               |
| `edit`     | (`code`: _string_, `device`: _Partial_<[_DeviceUpdateParams_](deviceupdateparams.md)\>) => _Promise_<[_Device_](device.md)\> |
| `get`      | (`code`: _string_) => _Promise_<[_Device_](device.md)\>                                                                      |
| `getAll`   | () => _Promise_<[_Device_](device.md)[]\>                                                                                    |
| `refer`    | (`code`: _string_, `\_\_namedParameters`: { `fileIds?`: _string_[] ; `notes?`: _string_ }) => _Promise_<void\>               |
| `reject`   | (`code`: _string_, `\_\_namedParameters`: { `fileIds?`: _string_[] ; `notes?`: _string_ }) => _Promise_<void\>               |
| `submit`   | (`code`: _string_, `\_\_namedParameters`: { `fileIds?`: _string_[] ; `notes?`: _string_ }) => _Promise_<void\>               |
| `verify`   | (`code`: _string_, `\_\_namedParameters`: { `fileIds?`: _string_[] ; `notes?`: _string_ }) => _Promise_<void\>               |
| `withdraw` | (`code`: _string_, `\_\_namedParameters`: { `notes?`: _string_ }) => _Promise_<void\>                                        |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:269](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L269)

---

### file

• get **file**(): _object_

**Returns:** _object_

| Name       | Type                                                        |
| :--------- | :---------------------------------------------------------- |
| `download` | (`code`: _string_) => _Promise_<string\>                    |
| `upload`   | (`files`: Blob[] \| _ReadStream_[]) => _Promise_<string[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:242](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L242)

---

### fuel

• get **fuel**(): _object_

**Returns:** _object_

| Name          | Type                                          |
| :------------ | :-------------------------------------------- |
| `getAll`      | () => _Promise_<[_Fuel_](fuel.md)[]\>         |
| `getAllTypes` | () => _Promise_<[_FuelType_](fueltype.md)[]\> |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:381](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L381)

---

### issue

• get **issue**(): _object_

**Returns:** _object_

| Name        | Type                                                                                 |
| :---------- | :----------------------------------------------------------------------------------- |
| `approve`   | (`code`: _string_, `approve`: [_ApproveIssue_](approveissue.md)) => _Promise_<void\> |
| `create`    | (`issue`: [_Issue_](issue.md)) => _Promise_<string\>                                 |
| `get`       | (`code`: _string_) => _Promise_<[_IssueWithStatus_](issuewithstatus.md)\>            |
| `getStatus` | (`code`: _string_) => _Promise_<[_IssueWithStatus_](issuewithstatus.md)\>            |
| `refer`     | (`code`: _string_, `notes?`: _string_) => _Promise_<void\>                           |
| `reject`    | (`code`: _string_, `notes?`: _string_) => _Promise_<void\>                           |
| `submit`    | (`code`: _string_, `notes?`: _string_) => _Promise_<void\>                           |
| `update`    | (`code`: _string_, `issue`: [_Issue_](issue.md)) => _Promise_<void\>                 |
| `verify`    | (`code`: _string_, `notes?`: _string_) => _Promise_<void\>                           |
| `withdraw`  | (`code`: _string_, `notes?`: _string_) => _Promise_<void\>                           |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:173](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L173)

---

### organisation

• get **organisation**(): _object_

**Returns:** _object_

| Name             | Type                                                |
| :--------------- | :-------------------------------------------------- |
| `get`            | () => _Promise_<[_Organisation_](organisation.md)\> |
| `getIssuers`     | () => _Promise_<[_CodeName_](codename.md)[]\>       |
| `getRegistrants` | () => _Promise_<[_CodeName_](codename.md)[]\>       |

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:142](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L142)

## Methods

### addListener

▸ **addListener**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:636

---

### applyTokens

▸ `Private`**applyTokens**(`accessToken`: _string_, `refreshToken`: _string_, `expiresIn`: _number_): _void_

#### Parameters:

| Name           | Type     |
| :------------- | :------- |
| `accessToken`  | _string_ |
| `refreshToken` | _string_ |
| `expiresIn`    | _number_ |

**Returns:** _void_

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:428](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L428)

---

### disableInterceptor

▸ `Private`**disableInterceptor**(): _void_

**Returns:** _void_

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:491](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L491)

---

### emit

▸ **emit**(`event`: _string_ \| _symbol_, ...`args`: _any_[]): _boolean_

#### Parameters:

| Name      | Type                 |
| :-------- | :------------------- |
| `event`   | _string_ \| _symbol_ |
| `...args` | _any_[]              |

**Returns:** _boolean_

Defined in: node_modules/@types/node/globals.d.ts:646

---

### enableErrorHandler

▸ `Private`**enableErrorHandler**(): _void_

**Returns:** _void_

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:500](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L500)

---

### enableInterceptor

▸ `Private`**enableInterceptor**(): _void_

**Returns:** _void_

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:478](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L478)

---

### ensureNotExpired

▸ `Private`**ensureNotExpired**(): _Promise_<void\>

**Returns:** _Promise_<void\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:469](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L469)

---

### eventNames

▸ **eventNames**(): (_string_ \| _symbol_)[]

**Returns:** (_string_ \| _symbol_)[]

Defined in: node_modules/@types/node/globals.d.ts:651

---

### getMaxListeners

▸ **getMaxListeners**(): _number_

**Returns:** _number_

Defined in: node_modules/@types/node/globals.d.ts:643

---

### listenerCount

▸ **listenerCount**(`type`: _string_ \| _symbol_): _number_

#### Parameters:

| Name   | Type                 |
| :----- | :------------------- |
| `type` | _string_ \| _symbol_ |

**Returns:** _number_

Defined in: node_modules/@types/node/globals.d.ts:647

---

### listeners

▸ **listeners**(`event`: _string_ \| _symbol_): Function[]

#### Parameters:

| Name    | Type                 |
| :------ | :------------------- |
| `event` | _string_ \| _symbol_ |

**Returns:** Function[]

Defined in: node_modules/@types/node/globals.d.ts:644

---

### login

▸ **login**(`userName`: _string_, `password`: _string_, `clientId`: _string_, `clientSecret`: _string_): _Promise_<[_AccessTokens_](../modules.md#accesstokens)\>

#### Parameters:

| Name           | Type     |
| :------------- | :------- |
| `userName`     | _string_ |
| `password`     | _string_ |
| `clientId`     | _string_ |
| `clientSecret` | _string_ |

**Returns:** _Promise_<[_AccessTokens_](../modules.md#accesstokens)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:56](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L56)

---

### off

▸ **off**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:640

---

### on

▸ **on**(`event`: _tokensRefreshed_, `listener`: (`accessTokens`: [_AccessTokens_](../modules.md#accesstokens)) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                                                                     |
| :--------- | :----------------------------------------------------------------------- |
| `event`    | _tokensRefreshed_                                                        |
| `listener` | (`accessTokens`: [_AccessTokens_](../modules.md#accesstokens)) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:35](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L35)

---

### once

▸ **once**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:638

---

### prependListener

▸ **prependListener**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:649

---

### prependOnceListener

▸ **prependOnceListener**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:650

---

### rawListeners

▸ **rawListeners**(`event`: _string_ \| _symbol_): Function[]

#### Parameters:

| Name    | Type                 |
| :------ | :------------------- |
| `event` | _string_ \| _symbol_ |

**Returns:** Function[]

Defined in: node_modules/@types/node/globals.d.ts:645

---

### redeem

▸ **redeem**(`redemption`: [_Redemption_](redemption.md)): _Promise_<[_RedeemTransactionResult_](redeemtransactionresult.md)\>

#### Parameters:

| Name         | Type                          |
| :----------- | :---------------------------- |
| `redemption` | [_Redemption_](redemption.md) |

**Returns:** _Promise_<[_RedeemTransactionResult_](redeemtransactionresult.md)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:414](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L414)

---

### refreshAccessTokens

▸ `Private`**refreshAccessTokens**(): _Promise_<[_AccessTokens_](../modules.md#accesstokens)\>

**Returns:** _Promise_<[_AccessTokens_](../modules.md#accesstokens)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:442](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L442)

---

### removeAllListeners

▸ **removeAllListeners**(`event?`: _string_ \| _symbol_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name     | Type                 |
| :------- | :------------------- |
| `event?` | _string_ \| _symbol_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:641

---

### removeListener

▸ **removeListener**(`event`: _string_ \| _symbol_, `listener`: (...`args`: _any_[]) => _void_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name       | Type                           |
| :--------- | :----------------------------- |
| `event`    | _string_ \| _symbol_           |
| `listener` | (...`args`: _any_[]) => _void_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:639

---

### setMaxListeners

▸ **setMaxListeners**(`n`: _number_): [_IRECAPIClient_](irecapiclient.md)

#### Parameters:

| Name | Type     |
| :--- | :------- |
| `n`  | _number_ |

**Returns:** [_IRECAPIClient_](irecapiclient.md)

Defined in: node_modules/@types/node/globals.d.ts:642

---

### transfer

▸ **transfer**(`transfer`: [_Transfer_](transfer.md)): _Promise_<[_TransactionResult_](transactionresult.md)\>

#### Parameters:

| Name       | Type                      |
| :--------- | :------------------------ |
| `transfer` | [_Transfer_](transfer.md) |

**Returns:** _Promise_<[_TransactionResult_](transactionresult.md)\>

Defined in: [packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts:400](https://github.com/energywebfoundation/origin/blob/1ec4bda2/packages/traceability/issuer-irec-api-wrapper/src/IRECAPIClient.ts#L400)

---

### listenerCount

▸ `Static`**listenerCount**(`emitter`: _EventEmitter_, `event`: _string_ \| _symbol_): _number_

**`deprecated`** since v4.0.0

#### Parameters:

| Name      | Type                 |
| :-------- | :------------------- |
| `emitter` | _EventEmitter_       |
| `event`   | _string_ \| _symbol_ |

**Returns:** _number_

Defined in: node_modules/@types/node/events.d.ts:23

---

### on

▸ `Static`**on**(`emitter`: _EventEmitter_, `event`: _string_): _AsyncIterableIterator_<any\>

#### Parameters:

| Name      | Type           |
| :-------- | :------------- |
| `emitter` | _EventEmitter_ |
| `event`   | _string_       |

**Returns:** _AsyncIterableIterator_<any\>

Defined in: node_modules/@types/node/events.d.ts:20

---

### once

▸ `Static`**once**(`emitter`: _NodeEventTarget_, `event`: _string_ \| _symbol_): _Promise_<any[]\>

#### Parameters:

| Name      | Type                 |
| :-------- | :------------------- |
| `emitter` | _NodeEventTarget_    |
| `event`   | _string_ \| _symbol_ |

**Returns:** _Promise_<any[]\>

Defined in: node_modules/@types/node/events.d.ts:18

▸ `Static`**once**(`emitter`: DOMEventTarget, `event`: _string_): _Promise_<any[]\>

#### Parameters:

| Name      | Type           |
| :-------- | :------------- |
| `emitter` | DOMEventTarget |
| `event`   | _string_       |

**Returns:** _Promise_<any[]\>

Defined in: node_modules/@types/node/events.d.ts:19
