<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./images/ew_origin.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

Energy Web (EW) Origin is a set of software development kits (SDKs) that together provide a system for the issuance, management and trading of [Energy Attribute Certificates (EACs)](./user-guide-glossary.md#energy-attribute-certificate). 

This site provides technical documentation for each SDK, as well as [user guides](./user-guides.md) on how to navigate the platform's user interface.   

We provide documentation on how to install, build and run the Origin platform [here](getting-started.md). 

## Energy Attribute Certificates
An Energy Attribute Certificate (EAC) is an official document that guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles.

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs can be traded and purchased on a marketplace so they can be used to address sustainability reports regarding [Scope 2 emissions](https://ghgprotocol.org/scope_2_guidance).

We provide more information on EACs in the glossary [here](./user-guide-glossary.md#energy-attribute-certificate). 

## Origin SDKs
Origin is comprised of [multiple SDKs](./packages.md) that can be used individually or in unison.  

The core SDKs are: 
+ [Device Registry](./device-registry.md)
+ [Traceability](./traceability.md) 
+ [Trade](./trade.md)  

The [Origin Backend](#origin-backend) provides authorization, organization and user management functionality. 

Below we provide a brief description of each SDK's core functionality and a link to further documentation. Any company or regulator can use one or several SDKs to build a platform for tracking and trading EACs.

### [**Device Registry SDK**](./device-registry.md)
The Device Registry SDK is used to register, manage and fetch devices. ‘Devices’ are electricity generating assets (e.g solar pv, hydroelectric dam, steam turbine). Because Energy Attribute Certificates are always tied to the device for which generation evidence was submitted, generation devices must be registered with Origin. Read more about the role of devices on the platform [here](./user-guide-reg-onboarding.md#devices).

See documentation for the Device Registry SDK [here](./device-registry.md). 

### [**Traceability SDK**](./traceability.md)
The Traceability SDK is used to enable certificate issuers (i.e. I-REC) to mint EAC's upon request based on provided generation evidence.  

In addition to minting new EAC’s, the Traceability SDK also ensures that the certificate lifecycle and its owners are in compliance with  regulation at all times. Each issuing standard (e.g. I-REC) has its own implementation of the traceability SDK to meet its regulatory needs. To ensure compliance with widely adopted standards EW Origin team is working directly with regulators and standardization bodies.  

See documentation for the Traceability SDK [here](./traceability.md). 

### [**Trade SDK**](./trade.md)
The Trade SDK is used to facilitate trading between buyers and sellers of EACs.   

This SDK is built on the basis of the [order book](./user-guide-glossary.md#order-book) system, where sellers post [asks](./user-guide-glossary.md#ask) and buyers post [bids](./user-guide-glossary.md#bid). When there is a match based on [EAC criteria](./trade/matching-criteria.md) and price, a trade is executed. 

See documentation for the Trade SDK [here](./trade.md). 

## Implementing Origin SDKs
The Origin SDKs are developed to be agnostic of registry and certificate standard implementation. Depending on implementation needs, users can implement one or all of the SDKs. The [Origin Backend package](#origin-backend) provides authorization and user/organization management, however users can integrate their implementation. The User Interface module provides a front-end application infrastructure for the marketplace. 

## [**Origin Backend**](./backend.md)
The Origin Backend is a NestJS application that provides services to manage authorization and user and organization management. The Origin Backend application can be used in conjunction with one, several or all of the [Origin SDKs](#origin-sdks) to provide integrated user management and authorization. 

See documentation for the Origin Backend application [here](./backend.md). 



