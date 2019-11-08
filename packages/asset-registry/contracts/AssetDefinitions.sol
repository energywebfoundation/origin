pragma solidity ^0.5.2;

contract AssetDefinitions {

    enum UsageType {
        Producing,
        Consuming
    }

    struct Asset {
        UsageType usageType;
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