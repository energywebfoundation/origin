pragma solidity ^0.5.0;

contract AssetStructs {

    struct Asset {
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
        bool active;
        string lastSmartMeterReadFileHash;
        string propertiesDocumentHash;
        string url;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }
}