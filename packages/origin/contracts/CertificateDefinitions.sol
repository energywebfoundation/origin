pragma solidity ^0.5.0;

contract CertificateDefinitions {

    enum CertificationRequestStatus {
        Pending,
        Approved
    }

    enum Status {
        Active,
        Claimed,
        Split
    }

    struct CertificationRequest {
        uint deviceId;
        uint readsStartIndex;
        uint readsEndIndex;
        CertificationRequestStatus status;
    }

    struct Certificate {
        uint deviceId;
        uint energy;
        uint status;
        uint creationTime;
        uint parentId;
        uint[] children;
        uint readsStartIndex;
        uint readsEndIndex;
    }
}