pragma solidity ^0.5.2;

contract DeviceDefinitions {
    struct Device {
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
        string lastSmartMeterReadFileHash;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }
}