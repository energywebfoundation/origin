# User Registration and Onboarding  
A guide for enrolling users, organizations and devices on the Origin platform.

## User Roles and Hierarchy  

To perform actions in the Origin marketplace, you must be a registered user associated with a registered organization. User registration is necessary because actions like device registry and requesting and claiming certificates must be mapped to specific entities in the system. __Registration is the only way to ensure accountability and prevent double counting__.  

Only registered users can:
1. Register [devices](./user-guide-device-management.md#devices)
2. Request [certificates](./user-guide-glossary.md#energy-attribute-certificate) issuance
3. Post [asks](./user-guide-glossary.md#ask) and bids(./user-guide-glossary.md#bid) on the [exchange](./user-guide-exchange.md)
4. Claim certificates for different purposes such as sustainability reporting  

In order to mirror typical organizational structures, the Origin marketplace has a hierarchy of organizations, users and devices.  
**Devices must be associated with a registered user, and users must be associated with a registered organization in order to register a device.**

[!UserHierarchy](images/onboarding/Onboarding1-Hierarchy.png)

### Organizations  
Organizations are registered businesses. They are registered in Origin by providing supporting documentation, and have multiple [users](#users) associated with them. View how to register organizations [here](#registering-organizations).

### Users  
Users are associated with an [organization](#organizations). A user can only be a member of one organization within the system at a time.   
Users can have different permissions which typically reflect the rights and responsibilities of specific employees or departments within the organization.  
Users can own / represent / manage generating devices (electricity generators), if they have the appropriate role in the system. View how to register users [below](#registering-users). Read more about devices in Origin [here](./user-guide-device-management.md/#devices). 

#### User Roles
User’s have one of three roles:
1. Admin
2. Device Manager 
3. Member

**Role Permissions for the reference implementation are as follows (note that role permissions can change according to implementation needs):**  

| Roles          | Permissions                                                                                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Org admin      | <ul><li>Add and remove users to the organization</li> <li>Register the organization with the issuing body (I-REC)</li> <li>Delete the organization</li> <li>Assign the admin role to other org members</li> <li>Start and accept device change of ownership</li> <li>Perform all actions tied to the organization, organization’s certificates, and organization’s devices</li> | <ul><li>Creator of the organization automatically becomes an organizational admin</li> <li>There can be multiple org admins</li> <li>Only members of the organization can become org admins</li> </ul> |
| Device manager | <ul> <li>Register new devices and device groups</li> <li>Request certification </li> <li>Delete devices</li> </ul>                                                                                                                                                                                                                                                              | <ul><li> The device manager is also an org member and can perform all actions of an org member</li></ul>                                                                                               |
| Org Member     | <ul><li>Post bids and asks</li><li>Transfer certificates</li><li>Claim certificates</li></ul>                                                                                                                                                                                                                                                                                   | <ul><li>Can be in multiple organizations, in each organization has a different role </li></ul>          

*Note that if a user creates an organization, they are automatically an administrator. Otherwise, users are given a designated role when an administrator invites them to join the organization. Read more about how to invite members [here](./user-guide-organization.md#invite).

### Devices  
Devices and their specific characteristics must be registered in the system to provide trust in the validity of certificates that they issue. However, __you do not need to be a registered user in order to see a list of registered devices or posted supplies and demands__. You will be asked to register once you want to interact with the system further. View how to register devices [below](#registering-devices). Read more about devices and device management in Origin [here](./user-guide-device-management.md). 

## Registering Users

To view the user registration interface, navigate to https://origin-ui-canary.herokuapp.com/auth/register, or click on “Register” in the top right hand corner of the Origin interface:  

[!register](images/onboarding/onboarding2-register.png)  

You can view and populate the suggested Know Your Customer (KYC) fields in the reference implementation for adding User Information. __Note that these fields can change based on implementation needs__.  

[!registrationUserFields](images/onboarding/onboarding3-userRegistrationFields.png)

*Note that if a user is not associated with an [organization](#organizations), the user will be prompted to register an organization once their email address is confirmed:

[!registrationorgPrompt](images/onboarding/onboarding4-registerorgprompt.png)

## Inviting New Users
Admin users can invite new users to joing their organization and assign them a specific role within the organization when the invitation is created. You can learn how to invite new members [here](./user-guide-organization.md#invite).  

### Connecting Blockchain Accounts

https://origin-ui-canary.herokuapp.com/account/profile

Origin uses the Energy Web blockchain for traceability and verification of ownership. Certificates are issued on the blockchain as tokens (you can read more about the certificate structure [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/883916918/Certificate+structure)). If your organization's users have registered devices on the Origin platform and want to be issued certifcates, sell certificates, trade certificates or retire certificates, the organization will need an Exchange Deposit address and an Organization Blockchain Account address, which are explained below. The process of withdrawing, transfering and retiring certificates is explained in greater detail in the [Certificate user guide](./user-guide-certificate.md).    

If you are a member of a registered organization and you navigate to your user profile and connect to MetaMask, you will see two Blockchain Addresses:

#### 1. Exchange Deposit Address

[!exchangeDepositAddress](images/onboarding/onboarding5-exchangedepositaddress.png)

The Exchange Deposit Address is the address that is used by the marketplace's integrated [exchange module](./trade.md). When an organization is registered, this address is auto-generated by the Origin platform.

[Energy Attribute Certificates (EACs)](./user-guide-glossary.md#energy-attribute-certificate) are represented as blockchain tokens (see Certificate structure), so they have to be transferred to the blockchain in order to be deposited to the Exchange. The Origin Exchange creates a unique smart contract wallet for each user that wants to trade on the exchange. This wallet acts as a deposit account on the exchange. **The address of this wallet is the Exchange Deposit Address**.  

As common practice for blockchain exchanges, this deposit account is tied to the user but owned by the Exchange operator on-chain. By depositing EACs to the Exchange, users put them in the custody of this operator. All operations that users can usually do with the on-chain EACs, like transferring and claiming them independently of a single application, are restricted this way. This ensures that all operations that are performed on the Origin Exchange are valid.

EACs that are deposited to the Exchange are stored in the Exchange user account. At this point, they are in play on the exchange. The user can choose to withdraw EACs from the Exchange user account if they are not currently being actively traded on the Exchange. *Deposits and withdrawals are the only on-chain events that happen when using the Exchange*.

#### 2. Organization's Blockchain Account Address

[!orgBlockchainAcccountAddress](images/onboarding/onboarding6-orgblockchain.png)

The Organization's blockchain account address is used for **withdrawing or claiming** certificates from the exchange and **retiring** them. The blockchain account address is the MetaMask address that is used when the admin first creates the Organization. Multiple users from the same organization can have access to this wallet address by importing the private key of this wallet into their MetaMask.  


## Registering Organizations
To view the organization registration interface, navigate to https://origin-ui-canary.herokuapp.com/organization/register, or click on ‘Organization’ on the side panel and select 'Register’:  

[!registerOrgSidePanel](images/onboarding/onboarding-orgregistrationpanel.png) 

You can view the suggested Know Your Customer (KYC) fields in the reference implementation for adding Organization Information, Authorized Signatory Information and supporting documents.   
These fields can be changed based on implementation needs.  

[!registerNewOrg](images/onboarding/onboarding-orgregistration.png)

## Registering Devices  
To view the device registration interface, navigate to https://origin-ui-canary.herokuapp.com/device/register, or click on Device on the side panel and select 'Register Device':  

[!registerDeviceSidePanel](images/onboarding/onboarding7-registerdevicesidepanel.png)

In order to register a device, the user must be registered with an existing organization. You can read more about registering organizations [here](#registering-organizations). 

You can view the suggested device registration fields in the reference implementation for adding Device Generation Information, Device Location Information and supporting documents. These fields can be changed based on implementation needs.  

[!registerNewDevice](images/onboarding/onboarding8-registernewdevice.png)













































