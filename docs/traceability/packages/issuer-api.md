# Issuer API

The issuer API is a [NestJS](https://nestjs.com/) package that provides restful endpoints for handling Certificate operations.  

## Certificate Persistence  

Certificate data is persisted in two locations: 
1. On the blockchain in the form of a token. Read more about this in the Issuer documentation [here](../../traceability.md#energy-attribute-certificates-on-the-blockchain).
2. In a relational database. Origin’s reference implementation uses [PostgreSQL](https://www.postgresql.org/) as its relational database, however other registries can be used according to implementation needs. 

The Issuer API uses a database for certificate data because it is more performant than querying the blockchain each time data is needed.  

When a certificate is requested, issued, or updated (i,e, if it has been transferred, claimed or revoked), this is reflected in the certificate’s record in the database as well as on the blockchain. The Issuer API queries the blockchain using the [Blockchain facade](../contracts/Issuer.md#blockchain-facade), and queries the database repository using a connection through [typeorm](https://typeorm.io/#/). 

Consider the code snippet below from the CreateCertificateRequestHandler class. The certificate is first created on the blockchain using the CertificationRequestFacade, and then created in the database using the repository service. You can see the source code [here](https://github.com/energywebfoundation/origin/blob/master/packages/traceability/issuer-api/src/pods/certification-request/handlers/create-certification-request.handler.ts). 

```
async execute({
       fromTime,
       toTime,
       deviceId,
       to,
       energy,
       files,
       isPrivate
   }: CreateCertificationRequestCommand): Promise<CertificationRequestDTO> {
       if (!isAddress(to)) {
           throw new BadRequestException(
               'Invalid "to" parameter, it has to be ethereum address string'
           );
       }
 
       const blockchainProperties = await this.blockchainPropertiesService.get();

       //Create Certificate on the blockchain using the blockchain facade: 
 
       try {
           const certReq = await CertificationRequestFacade.create(
               fromTime,
               toTime,
               deviceId,
               blockchainProperties.wrap(),
               to
           );
           this.logger.debug(
               `Certification request ${certReq.id} has been deployed with id ${certReq.id} `
           );
 
        //Create instance of the Certificate in the database:

           const certificationRequest = this.repository.create({
               id: certReq.id,
               deviceId,
               energy,
               fromTime,
               toTime,
               approved: false,
               revoked: false,
               files,
               isPrivate: isPrivate ?? false,
               owner: getAddress(to)
           });
 
           return this.repository.save(certificationRequest);
       } catch (e) {
           this.logger.error(
               `Certification request creation has failed with the error: ${e.message}`
           );
```







