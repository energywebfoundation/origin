pragma solidity ^0.5.2;

contract DeviceDefinitions {
    struct Device {
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }
}