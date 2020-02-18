pragma solidity ^0.5.0;

contract CertificateDefinitions {

    enum Status {
        Active,
        Claimed,
        Split
    }

    struct Certificate {
        uint deviceId;
        uint energy;
        uint status;
        uint creationTime;
        uint parentId;
        uint[] children;
        string certificationRequestId;
    }
}