# Origin Backend
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend)

The Origin Backend is a [NestJS](https://nestjs.com/) application that provides services for user and organization authorization and management. The Backend application can be used in conjunction with one, several or all of the [Origin SDKs](./index#origin-sdks) to provide integrated user management and authorization. 

The below gives an overview the of the package architecture, however the NestJS documentation provides further detail into the fundamentals of NestJS Architecture that may help to understand the elements of this application:
- [Custom Providers as Services](https://docs.nestjs.com/fundamentals/custom-providers#custom-providers)
- [Dependency Injection](https://docs.nestjs.com/providers#dependency-injection)
- [CQRS (Command and Query Responsibility Segregation)](https://docs.nestjs.com/recipes/cqrs)
- [Modules](https://docs.nestjs.com/modules)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM repository design pattern](https://docs.nestjs.com/techniques/database#repository-pattern)

## Origin Backend Architecture

The Origin Backend package is broken down into seven NestJS modules or ['pods'](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods):  

+ [admin](#admin)
+ [configuration](#configuration)
+ [email-confirmation](#email-confirmation)  
+ [file](#file)  
+ [invitation](#invitation) 
+ [organization](#organization)
+ [user](#user)  

In general, each 'pod' or NestJS module has:  
  + A [controller](https://docs.nestjs.com/controllers) that manages requests and responses to the client
  + A .entity file that maps an entity to the database repository
  + A .service file that provides methods to fetch and transform data
  + [Data Transfer Object (DTO) file(s)](https://docs.nestjs.com/controllers#request-payloads) that provide Data Transfer Objects, which are representations of the data that are exposed to the endpoint consumer  
  + A [module](https://docs.nestjs.com/modules) class that is used by NestJS to structure the application


### admin
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/admin) 

The admin module's controller uses the user service(link) to fetch and update user information. 

### configuration
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/configuration)

The configuration module fetches and updates the platform's configuration settings. 

### email-confirmation
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/email-confirmation)

The email-confirmation module provides methods to manage the email confirmation process. When users register to join the platform, they must confirm their email. Confirmations are persisted in the Email Confirmation repository. 

### file
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/file)

The email-confirmation module provides methods to fetch, update and store files. Files are uploaded to the system when registering an organization, a device or requesting certification. Files are persisted in the File repository. 

### invitation
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/invitation)

The invitation module provides methods to manage invitations for users to join organizations. Invitations are persisted in the Invitation repository. 

### organization
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/organization)

The invitation module provides methods to manage fetch, create and update Organizations and their Blockchain Account Addresses. Organizations are persisted in the Organization Repository. 

### user 
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend/src/pods/user)

The user module provides methods to manage fetch, create and update users. Users are persisted in the User Repository. 

## Origin Backend-Core Package
[**Source code on GitHub:**](https://github.com/energywebfoundation/origin/tree/master/packages/origin-backend-core)
The Origin Backend Core package provides the interfaces, types and enums for Origin Backend.









