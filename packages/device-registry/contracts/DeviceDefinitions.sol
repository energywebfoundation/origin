pragma solidity ^0.5.2;

contract DeviceDefinitions {
    enum DeviceStatus {
        Submitted,
        Denied,
        Active
    }

    struct Device {
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
        DeviceStatus status;
        string lastSmartMeterReadFileHash;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }
}