# Device Registry API - @energyweb/origin-device-registry-api
[**Source code on GitHub**:](https://github.com/energywebfoundation/origin/tree/master/packages/devices/origin-device-registry-api)

## Overview
The Device Registry API is a [NestJS](https://nestjs.com/) package that provides restful endpoints for fetching and creating/persisting Devices.  

The below gives an overview the of the package architecture, however the NestJS documentation provides further detail into the fundamentals of NestJS Architecture that may help to understand the elements of this application:  

- [Custom Providers as Services](https://docs.nestjs.com/fundamentals/custom-providers#custom-providers)
- [Dependency Injection](https://docs.nestjs.com/providers#dependency-injection)
- [CQRS (Command and Query Responsibility Segregation)](https://docs.nestjs.com/recipes/cqrs)
- [Modules](https://docs.nestjs.com/modules)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM repository design pattern](https://docs.nestjs.com/techniques/database#repository-pattern)  

## Device Registry API Architecture  
The Device Registry API exports [one module](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/app.module.ts), which is the Device Registry Module. The module contains:  

+ A [controller](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/device-registry.controller.ts) that manages requests and responses to the client
+ An [entity file](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/origin-device.entity.ts) that maps an entity to a database repository
+ A [service file](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/device-registry.service.ts) that provides methods to fetch and transform data
+ [Data Transfer Object (DTO) file(s)](https://docs.nestjs.com/controllers#request-payloads) that provide Data Transfer Objects, which are representations of the data that are exposed to the endpoint consumer  
+ A [module](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/device-registry.module.ts) class that is used by NestJS to structure the application  

### Service Endpoints
The [services file](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/device-registry.service.ts ) provides public methods to fetch and create new devices:

```
    public async find(options?: FindManyOptions<OriginDevice>): Promise<OriginDevice[]> {
        return this.repository.find(options);
    }
```
[source](https://github.com/energywebfoundation/origin/blob/aaf518c1093330af1c671022b2c0c01b0e809cc6/packages/devices/origin-device-registry-api/src/device-registry/device-registry.service.ts#L22)

```
    public async register(user: ILoggedInUser, newDevice: NewDeviceDTO): Promise<string> {
        await this.validateRegistration(user, newDevice);

        const deviceToStore = new OriginDevice({
            ...NewDeviceDTO.sanitize(newDevice),
            owner: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        return storedDevice.id;
    }
```
[source](https://github.com/energywebfoundation/origin/blob/aaf518c1093330af1c671022b2c0c01b0e809cc6/packages/devices/origin-device-registry-api/src/device-registry/device-registry.service.ts#L30)

### Persistence
Device information is persisted in the Origin Device Repository. The [Origin Device entity file](https://github.com/energywebfoundation/origin/blob/master/packages/devices/origin-device-registry-api/src/device-registry/origin-device.entity.ts) maps the Device data to a strongly typed entity in the repository. 

Repositories are [injected](https://docs.nestjs.com/providers#dependency-injection) into services or command handlers so they are available to use in methods:

```
@Injectable()
export class DeviceRegistryService {
    constructor(
        @InjectRepository(OriginDevice) private readonly repository: Repository<OriginDevice>,
        private readonly queryBus: QueryBus
    ) {}

    public async find(options?: FindManyOptions<OriginDevice>): Promise<OriginDevice[]> {
        return this.repository.find(options);
    }
...
}
```
[source](https://github.com/energywebfoundation/origin/blob/f8db6c42a425225a3b91e8e3b423a7224a842a0e/packages/devices/origin-device-registry-api/src/device-registry/device-registry.service.ts#L15)

Note that the device entity fields are dependent on implementation needs and the registry that the application will integrate with. If, for example, the registry will integrate with I-REC, different or additional fields will be required to conform to I-REC's device registration standards. 

The External Registry Id is the Id of this device in another external (e.g. I-REC) registry. **Note** that the Smart Meter Id and External Registry Id can only be tied to one device. 

### Reference Implentation
- [Devices User Guide](../device-guides/device-guide-intro.md)







