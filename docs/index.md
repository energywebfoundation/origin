<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./images/ew_origin.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>

Energy Web (EW) Origin is a set of software development kits (SDKs) that together provide a system for the issuance, management and trading of [Energy Attribute Certificates (EACs)](./user-guide-glossary.md#energy-attribute-certificate). 


This site provides technical documentation for each SDK, as well as [user guides](./user-guides.md) on how to navigate and use the platform's user interface. 

We provide documentation on how to install, build and run the Origin platform [here](getting-started.md). 

## Energy Attribute Certificates

An Energy Attribute Certificate (EAC) is an official document that guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles.

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs are mostly used to address sustainability reports regarding [Scope 2 emissions](https://ghgprotocol.org/scope_2_guidance).

We provide more information on EACs in the glossary [here](./user-guide-glossary.md#energy-attribute-certificate). 

## Origin SDKs

The Origin SDK is comprised of [multiple SDKs](./packages.md) that can be used individually or in unison.  

The key SDKs are Registry, [Traceability](./traceability.md), [Trade](./trade.md), and the user interface (UI). Below we provide a brief description of each SDK's core functionality. Interested companies and regulators around the world can use parts of or all SDKs to build a platform for tracking and trading EACs.

### Registry

The Registry SDK stores user and device information.  

The registry enables both on- and off-chain storage capabilities. The off-chain component ensures that private information are safely and securely kept away from the public domain. The on-chain component leverages on-chain proofs to ensure that off-chain data is verifiable and tamper-proof.

### [Traceability](./traceability.md)

The Traceability SDK is used to enable issuers to mint EAC's upon request based on provided generation evidence.  

In addition to minting new EAC’s, the Traceability SDK also ensures that the certificate lifecycle and its owners are in compliance with  regulation at all times. Each issuing standard (e.g. I-REC) has its own implementation of the traceability SDK to meet its regulatory needs. To ensure compliance with widely adopted standards EW Origin team is working directly with regulators and standardization bodies.

### Trade

The Trade SDK is used to facilitate trading between buyers and sellers of EACs.   

This SDK is built on the basis of the order book system, where sellers post [asks](./user-guide-glossary.md#ask) and buyers post [bids](./user-guide-glossary.md#bid). When there is a match based on EAC criteria and price, the trade is executed.

### UI Module

The UI module is the user interface that connects all of the underlying SDKs listed above, and makes them accessible to the end-user as an online EAC marketplace.  

It serves as a demonstration of how easy it is to build an open, transparent, and regulatory compliant market for EACs around the world.
