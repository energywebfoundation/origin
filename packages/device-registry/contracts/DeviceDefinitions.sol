pragma solidity ^0.5.2;

contract DeviceDefinitions {
    enum DeviceStatus {
        Submitted,
        Denied,
        Active
    }

    enum UsageType {
        Producing,
        Consuming
    }

    struct Device {
        UsageType usageType;
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
        DeviceStatus status;
        string lastSmartMeterReadFileHash;
        string propertiesDocumentHash;
        string url;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }
}