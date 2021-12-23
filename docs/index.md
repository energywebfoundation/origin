<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./images/ew_origin.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

# Energy Web Origin Overview 
Energy Web (EW) Origin is a set of software development kits (SDKs) and backend services that together provide a platform for the issuance, management and trading of [Energy Attribute Certificates (EACs)](./user-guide-glossary.md#energy-attribute-certificate). 

An Energy Attribute Certificate (EAC) is an official document that guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles.

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs can be traded and purchased on a marketplace so they can be used to address sustainability reports regarding [Scope 2 emissions](https://ghgprotocol.org/scope_2_guidance).

We provide more information on EACs in the glossary [here](./user-guide-glossary.md#energy-attribute-certificate).  

## Documentation Overview
This site provides technical documentation for each SDK's generic implementations (i.e. not I-REC specific implementations), as well as [user guides](./user-guides.md) on how to navigate the reference implementation platform's user interface (read more about the reference implementation [below](#origin-platform-reference-implementation)).  

<div class="admonition note">
  <p class="first admonition-title">Note</p>
  <p class="last">
   Although this documentation only covers the packages built for generic (i.e. not I-REC compliant) implementation, each SDK does contain I-REC specific packages that comply and integrate with the I-REC registry. You can find those packages in the SDK's GitHub repository. 
  </p>
</div>

## Origin SDKs
Origin is comprised of [multiple SDKs](./packages.md) that can be used individually or in unison.

The core SDKs are: 

+ [Device Registry](./device-registry.md)
+ [Traceability](./traceability.md) 
+ [Trade](./trade.md)  

The SDKs integrate with the [Origin Backend](#origin-backend), which provides authorization, and organization and user management functionality. 

Below we provide a brief description of each SDK's core functionality and a link to further documentation.

### [**Device Registry SDK**](./device-registry.md)
The Device Registry SDK is used to register, manage and fetch devices. ‘Devices’ are electricity generating assets (e.g solar pv, hydroelectric dam, steam turbine). Because Energy Attribute Certificates are always tied to the device for which generation evidence was submitted, generation devices must be registered with Origin. Read more about the role of devices on the platform [here](./user-guide-reg-onboarding.md#devices).

See documentation for the Device Registry SDK [here](./device-registry.md). 

### [**Traceability SDK**](./traceability.md)
The Traceability SDK is used to enable certificate issuing bodies to mint on-chain EAC's upon request based on provided generation evidence, and to manage the on-chain lifecycle (transferring, claiming) of certificates. This SDK contains the smart contracts for certificate issuance, as well as methods to interact with and manage certificates on the blockchain after issuance.  

The Traceability SDK ensures that the certificate lifecycle and its owners are in compliance with regulation at all times. Each issuing standard (e.g. I-REC) has its own implementation of the traceability SDK to meet its regulatory needs. To ensure compliance with widely adopted standards EW Origin team is working directly with regulators and standardization bodies.  

See documentation for the Traceability SDK [here](./traceability.md). 

### [**Trade SDK**](./trade.md)
The Trade SDK is used to facilitate trading of EACs between buyers and sellers, and to manage EACs that are active on the Exchange (transferring, withdrawing, claiming).    

This SDK is built on the basis of the [order book](./user-guide-glossary.md#order-book) system, where sellers post [asks](./user-guide-glossary.md#ask) and buyers post [bids](./user-guide-glossary.md#bid). When there is a match based on [EAC criteria](./trade/matching-criteria.md) and price, a trade is executed. 

See documentation for the Trade SDK [here](./trade.md). 

### Implementing Origin SDKs
The Origin SDKs are developed to be agnostic of registry and certificate standard implementation. Depending on implementation needs, users can implement one or all of the SDKs. By design, the SDK packages are loosely coupled, which enables the possibility to implement solutions that consist of only part of the Origin features, such as:

-   Issuance only
-   Device registry only
-   Trading only  

 The [Origin Backend package](#origin-backend) provides authorization and user/organization management, however users can integrate their backend implementation. 

## [**Origin Backend**](./backend.md)
The Origin Backend is a [NestJS](https://docs.nestjs.com/) application that provides services to manage authorization and user and organization management. The Origin Backend application can be used in conjunction with one, several or all of the [Origin SDKs](#origin-sdks) to provide integrated user management and authorization. 

See documentation for the Origin Backend application [here](./backend.md). 

## **Origin UI**
[Source code on GitHub](https://github.com/energywebfoundation/origin/tree/master/packages/ui/apps/origin-ui)

The Origin UI package provides the code for the full, end-to-end I-REC-compliant reference implementation (see the source code [here](https://github.com/energywebfoundation/origin/tree/master/packages/ui/apps/origin-ui)), as well as modularized libraries for each interface component. **Note that the UI components use the I-REC implementation of the SDKs,** so these serve more as a reference guide for generic implementations rather than for direct use. See an overview of the reference implementation [here](./user-guides.md) in the User Guides section. 

All UI components are built with [React](https://reactjs.org/). For data fetching, UI components use [React Query](https://react-query.tanstack.com/overview) to access each SDK's controller methods. 

### UI Libraries
UI libraries provide packages that are modularized according to each reference implementation view:  

+ [certificate](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/certificate)
+ [device](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/device)
+ [exchange](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/exchange)
+ [organization](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/organization)
+ [user](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/user)
+ [main UI](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/ui)  

## Origin Platform Reference Implementation
The [Origin repository](https://github.com/energywebfoundation/origin) provides a full reference implementation for an end-to-end, I-REC-compliant platform for device and organization registry, user management and Certificate issuance and trading.  

+ See documentation on how to install, build and run Origin's reference implementation platform locally [here](getting-started.md)
+ See the user guides for the reference implementation platform [here](./user-guides.md) 



