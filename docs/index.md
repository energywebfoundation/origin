# Energy Web Origin

Energy Web (EW) Origin is a set of software development kits (SDKs) that together provide a system for the issuance and management of Energy Attribute Certificates (EACs).

EAC is an official document which guarantees that produced energy comes from a renewable source. There are different standards that regulate how data is stored and validated. In Europe, this document is called Guarantee of Origin (GO), in North America, it's called Renewable Energy Certificate (REC), and in parts of Asia, Africa, the Middle East, and Latin America governing standard is International REC (I-REC). Standards do vary, but they all share the same core principles.

The main purpose of EACs is to act as an accounting vehicle to prove that consumed energy came from a renewable source. EACs are mostly used to address sustainability reports regarding Scope 2 emissions.

EW Origin SDK is comprised of multiple modules that can be used individually or in unison. Key modules are registry, issuer, exchange, and UI. Interested companies and regulators around the world can use parts of or all modules to build a platform for tracking and trading EACs.

The registry module has a goal of storing user and device information. The registry enables both on- and off-chain storage capabilities. The off-chain part ensures that private information are safely and securely kept away from the public domain. On the other hand, the registry leverages on-chain proofs to ensure that off-chain data is verifiable and tamper-proof.

The issuer module is used to enable issuers to mint EAC's upon request based on provided generation evidence. Besides just minting new EAC’s, the issuer module also ensures that the certificate lifecycle and owners is always in compliance with the regulation. In EW Origin SDK each standard has its implementation of the issuer module. And to ensure compliance with widely adopted standards EW Origin team is working directly with regulators and standardization bodies.

The exchange module is used to facilitate trading between buyers and sellers of EACs. The exchange module is built on the bases of the order book system where sellers post asks and buyers post bids. Once there’s a match based on EAC criteria and price the trade is executed.

The UI module is the glue that connects all underlying modules and makes them accessible to the end-user. It’s also a demonstration of how easy it is to build an open, transparent, and regulatory compliant market for EACs around the world.
