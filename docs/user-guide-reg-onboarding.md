# User Registration and Onboarding  
A guide for enrolling users, organizations and devices on the Origin platform.

## User Roles and Hierarchy  

To perform actions in the Origin marketplace, you must be a registered [user](#users) associated with a registered [organization](#organizations). User registration is necessary because actions like device registry and requesting and claiming certificates must be mapped to specific entities in the system. __Registration is the only way to ensure accountability and prevent double counting__.  

Only users registered with an Organization can:  

1. Register [devices](./device-guides/device-guide-intro.md). User must have the role of Admin or Device Manager within an Organization (see [User Roles](#user-roles) below).  
2. Request [certificates](./user-guide-glossary.md#energy-attribute-certificate) issuance. User must have the role of Admin or Device Manager within an Organization (see [User Roles](#user-roles) below) in order to do this.  
3. Post [asks](./user-guide-glossary.md#ask) and [bids](./user-guide-glossary.md#bid) on the [exchange](./user-guide-exchange.md) 
4. [Claim certificates](./certificate-guides/claims-report.md) for different purposes such as sustainability reporting  

In order to mirror typical organizational structures, the Origin marketplace has a hierarchy of **organizations, users and devices.**  

Devices must be registered by a user. Users must be associated with a registered organization and have a specific role in order to register a device.

![UserHierarchy](images/onboarding/Onboarding1-Hierarchy.png)

### Organizations
Users and their permissions in the Origin marketplace are tied to digital entities that are called 'organizations'. Every organization has an admin user that must provide a set of mandatory information to register the organization. All required information and documents are provided through a user interface.  After the organization is successfully registered, the admin user account can perform user management. New users can be invited to join the organization and can be given specific permissions. As the name suggests, organizations are mostly companies that specify permissions for the user accounts of their employees. To ensure that only registered users can perform actions in the system, every user has to be associated with an organization, be a lead user or go through a Know-Your-Customer (KYC) process as a user. 

If Origin is integrated into a certificate registry, organizations that own generation devices have to be authenticated as active members of the certificate registry to interact with the system. This means that in order for users to be allowed to perform actions like device management or requesting certificates, their organization must have a confirmed active membership in the registry. Accordingly, if the membership is suspended or terminated, this will prevent all the users associated with this organization from interacting with the Origin marketplace. 

### Users  

To manage users and devices, request certificates, post supplies and demands, and claim certificates, users need to have an account in Origin. Users are associated with an [organization](#organizations). The main account of every organization is the lead user. Organizations use this account to create other user accounts and perform user management. The lead user sets permissions for all created users based on their roles in the organization. Roles and their permissions are explained [below](#user-roles). All users that are created by the organization's admin user are automatically associated to the organization and do not have to go through any additional KYC process. A user can only be a member of one organization within the system at a time. 

Buyer organizations mostly do not require synchronization with a certificate registry (e.g. I-REC). As a result, they will not need an account in the compliance registry and Origin is the single point of truth for their user accounts. Buyers only have to register with Origin to interact with the marketplace.

View how to register users [below](#registering-users). Read more about devices in Origin [here](./user-guide-device-management.md/#devices). 

#### User Roles
Users have one of three roles within an organization:  

1. Admin
2. Device Manager 
3. Member

##### User Role Permissions
Role Permissions for the [reference implementation](https://origin-ui-canary.herokuapp.com/) are as follows: 

| Roles          | Permissions                                                                                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Org admin      | <ul><li>Add and remove users to the organization</li> <li>Register the organization with the issuing body (e.g. I-REC)</li> <li>Delete the organization</li> <li>Assign the admin role to other org members</li> <li>Start and accept device change of ownership</li> <li>Perform all actions tied to the organization, organization’s certificates, and organization’s devices</li> | <ul><li>Creator of the organization automatically becomes an organizational admin</li> <li>There can be multiple org admins</li> <li>Only members of the organization can become org admins</li> </ul> |
| Device manager | <ul> <li>Register new devices and device groups</li> <li>Request certification </li> <li>Delete devices</li> </ul>                                                                                                                                                                                                                                                              | <ul><li> The device manager is also an org member and can perform all actions of an org member</li></ul>                                                                                               |
| Org Member     | <ul><li>Post bids and asks</li><li>Transfer certificates</li><li>Claim certificates</li></ul>                                                                                                                                                                                                                                                                                   | <ul><li>Can be in multiple organizations, in each organization has a different role </li></ul>          

Each role has varying access to the interfaces on the platform:

![user-role-views](images/onboarding/onboarding-roleviews.png)

**Note that if a user creates/registers an organization, they are automatically an administrator.** Otherwise, users are given a designated role when an administrator invites them to join the organization. Read more about how to invite members [here](./organization-guides/invite.md).

### Devices  

‘Devices’ are electricity generating assets (e.g solar pv, hydroelectric dam, steam turbine). Because [Energy Attribute Certificates](./user-guide-glossary.md#energy-attribute-certificate) are always tied to the device for which generation evidence was submitted, generation devices must be registered with Origin. The certificate inherits many characteristics from the generation device. As a result, it is essential to have certainty about which device the certificate came from and that the stated device characteristics are correct. Only allowing generation evidence from registered devices therefore facilitates traceability and prevents misconduct. If Origin is fully integrated with a certificate registry (e.g. I-REC), it relies on the registration process implemented by this registry. Only devices that have passed the rigorous requirements enforced by the registry, which often include on-site visits by independent device verifiers, can request certificates in Origin. 

All necessary information and documents to register a device in Origin can be provided through a user interface. If Origin is integrated with a compliance registry, a registration request is automatically forwarded to the registry, where their registration process is initiated. Everything that involves the registration process of the registry, e.g. if there is a need for a on-site visit or additional documents, is handled directly between the user and the registry. Devices that are already registered with the compliance registry must to be imported into Origin (read about how to import devices [here](./device-guides/import-device.md)). Only users that are authenticated as active members of the certificate registry can import their devices. This way it is ensured that no one else can import devices and claim certificates in Origin but the verified owner of the device. 

 __You do not need to be a registered user in order to see a list of registered devices in the Origin platform, or posted supplies and demands__. You will be asked to register once you want to interact with the system further.  
 
 View how to register devices [below](#registering-devices). Read more about devices and device management in Origin [here](./device-guides/device-guide-intro.md). 

## Registering Users

To view the user registration interface, navigate to [https://origin-ui-canary.herokuapp.com/auth/register](https://origin-ui-canary.herokuapp.com/auth/register), or click on “Register” in the top right hand corner of the Origin interface:  

![register](images/onboarding/onboarding2-register.png)  

You can view and populate the suggested Know Your Customer (KYC) fields in the reference implementation for adding User Information. __Note that these fields can change based on implementation needs__.  

![registrationUserFields](images/onboarding/onboarding3-userRegistrationFields.png)

*Note that if a user is not associated with an [organization](#organizations), the user will be prompted to register an organization once their email address is confirmed:

![registrationorgPrompt](images/onboarding/onboarding4-registerorgprompt.png)

## Inviting New Users
Admin users can invite new users to joing their organization and assign them a specific role within the organization when the invitation is created. You can learn how to invite new members [here](./organization-guides/invite.md).  

## Connecting Blockchain Accounts

[https://origin-ui-canary.herokuapp.com/account/profile](https://origin-ui-canary.herokuapp.com/account/profile)

Origin uses the Energy Web blockchain for traceability and verification of certificate ownership. Certificates are issued on the blockchain as tokens (you can read more about the certificate structure [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/883916918/Certificate+structure)).  

If your organization's users have registered devices on the Origin platform and want to be issued certifcates, sell certificates, trade certificates or retire certificates, the organization will need an Exchange Deposit address and an Organization Blockchain Account address, which are explained below. 

- The process of selling, withdrawing, transfering and exporting certificates is explained in greater detail in the [Certificate user guide on the Exchange Inbox](./certificate-guides/exchange-inbox.md).
- The process of selling, depositing certificates onto the exchange, retiring and transferring certificates is explained in greater detail in the [Certificate user guide on the Blockchain Inbox](./certificate-guides/blockchain-inbox.md).    

If you are a member of a registered organization and you navigate to your user profile and connect to MetaMask, you will see two Blockchain Addresses:

#### 1. Exchange Deposit Address

![exchangeDepositAddress](images/onboarding/onboarding5-exchangedepositaddress.png)

The Exchange Deposit Address is the address that is used by the marketplace's integrated. When an organization is registered, this address is auto-generated by the Origin platform.

[Energy Attribute Certificates (EACs)](./user-guide-glossary.md#energy-attribute-certificate) are represented as blockchain tokens (read more about the certificate structure [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/883916918/Certificate+structure)), so they must be transferred to the blockchain in order to be deposited to the Exchange. The Origin Exchange creates a unique smart contract wallet for each user that wants to trade on the exchange. This wallet acts as a deposit account on the exchange. **The address of this wallet is the Exchange Deposit Address**.  

As common practice for blockchain exchanges, this deposit account is tied to the user but _owned by the Exchange operator on-chain_. By depositing EACs to the Exchange, users put them in the custody of this operator. All operations that users can usually do with the on-chain EACs, like transferring and claiming them independently of a single application, are restricted this way. This ensures that all operations that are performed on the Origin Exchange are valid.

EACs that are deposited to the Exchange are stored in the Exchange user account. At this point, they are in play on the exchange. The user can choose to withdraw EACs from the Exchange user account if they are not currently being actively traded on the Exchange. You can view your certificates that are in the Exchange user account in the [Exchange Inbox interface](./certificate-guides/exchange-inbox.md). *Deposits and withdrawals are the only on-chain events that happen when using the Exchange*.

#### 2. Organization's Blockchain Account Address

![orgBlockchainAcccountAddress](images/onboarding/onboarding6-orgblockchain.png)

When an issuing body issues a certificate, it is deposited into the organization's Blockchain Account Address. If you want make your certificates active on the exchange in order to sell or transfer them, you must deposit them onto the exchange. If you want to withdraw or claim the certificates and retire them for sustainability reporting purposes, they must be in the Blockchain account. You can view your certificates that are in the Blockchain account in the [Blockchain Inbox interface](./certificate-guides/blockchain-inbox.md).  

The blockchain account address is the MetaMask address that is used when the admin first creates the Organization and sets up the Organization's blockchain account address. **Multiple users from the same organization can have access to this wallet address by importing the private key of this wallet into their MetaMask.**  


## Registering Organizations
To view the organization registration interface, navigate to [https://origin-ui-canary.herokuapp.com/organization/register](https://origin-ui-canary.herokuapp.com/organization/register), or click on ‘Organization’ on the side panel and select 'Register’:  

![registerOrgSidePanel](images/onboarding/onboarding-orgregistrationpanel.png) 

You can view the suggested Know Your Customer (KYC) fields in the reference implementation for adding Organization Information, Authorized Signatory Information and supporting documents.   
These fields can be changed based on implementation needs.  

![registerNewOrg](images/onboarding/onboarding-orgregistration.png)

## Registering Devices  
To view the device registration interface, navigate to [https://origin-ui-canary.herokuapp.com/device/register](https://origin-ui-canary.herokuapp.com/device/register), or click on Device on the side panel and select 'Register Device':  

![registerDeviceSidePanel](images/panels/panel-device-registerdevice.png)

In order to register a device, the user must be registered with an existing organization. You can read more about registering organizations [here](#registering-organizations). 

You can view the suggested device registration fields in the reference implementation for adding Device Generation Information, Device Location Information and supporting documents. These fields can be changed based on implementation needs.  

![registerNewDevice](images/onboarding/onboarding8-registernewdevice.png)













































