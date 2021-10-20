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

Origin leverages blockchain for traceability and verification of ownership. If you are a device owner, you will need a blockchain account to request certificates. If you are a buyer on the platform, you do not have to have a blockchain account as the platform itself is representing you in the certificate registry (e.g. I-REC registry). If you are a device owner, read on to learn how to connect your blockchain account to the Origin platform.

#### Exchange Deposit Address

[!exchangeDepositAddress](images/onboarding/onboarding5-exchangedepositaddress.png)

The Exchange Deposit Address is the address that is used by the marketplace's integrated exchange module. **Every [organization](#organizations) has one exchange deposit address**. Certificates are deposited to this address and can be traded on the exchange. Certificates in this address are available to all organization members. 

The address is created and managed by the platform - __you do not need to connect your own blockchain wallet for the Exchange Deposit Address__. **By default, all certificates are directly issued to the organization's exchange deposit address.**

#### Organization's Blockchain Account Address

The Organization's 
[!orgBlockchainAcccountAddress](images/onboarding/onboarding6-orgblockchain.png)

GET CLARITY ON THIS

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













































