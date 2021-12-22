# Devices
- [**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/devices)
- [**UI Components**](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/device)



‘Devices’ are electricity generating assets (e.g solar pv, hydroelectric dam, steam turbine.) They must be registered in the system to provide their capacity, location and generation data. This data is used to provide trust in the validity of the certificates that are issued for their generation.  

A user that is associated with a registered [organization](../user-guide-reg-onboarding.md#organizations) can [register a device](../user-guide-reg-onboarding.md#registering-devices) within the system if they have the necessary role permissions. In the Origin reference implementation, only the Admin and Device Manager roles can register devices. Read more about role permissioning [here](../user-guide-reg-onboarding.md#user-roles-and-hierarchy). 

## Accessing Device Generation Data
Origin offers the possibility to connect an external metering system. In order for this to work, a custom integration to the specific metering system is required. Devices must be approved by the issuer in order to be used on the platform.

The local issuer receives the device registration through Origin's [Register Device](./register-device.md) interface, and can verify the data and approve the device. Everything that involves additional processes of the registry, (e.g. if there is a need for an on-site visit or additional documents), is handled directly between the user and the registry.

Once you have an active account in the Origin platform and are part of an organization, you can register your devices on the platform ([read more about steps for device registration](./register-device.md)).

## Managing Devices on the Origin Platform

The Device interface has five views: 

1. <b>[All Devices:](./all-devices.md)</b> Allows any user to see all registered devices within a marketplace. Selecting a single device allows you to see the detail view of each device. You do not need to be logged in to view this interface
2. <b>[Map View:](./map-view.md)</b> Allows any user to see registered devices within a marketplace as locations on a map. Selecting a single device allows you to see the detail view of each device. You do not need to be logged in to view this interface
3. <b>[My Devices:](./my-devices.md)</b> Allows any logged in user to see their organization’s registered devices
4. <b>[Register Device:](./register-device.md)</b> Allows any logged in user that is registered with an organization as a Device Manager or Admin to register a device on behalf of that organization
5. <b>[Import Device:](./import-device.md)</b> Allows any logged in user that is registered with an organization as a Device Manager or Admin to import their organization's devices that are currently registered with I-REC and not registered on the Origin platform  

![devices](../images/panels/devices.png)
