# User Guide - Onboarding


## User Registration

To create an account you have to register a user. After registration you can log in with email and password. 

In order to interact with the marketplace, every user has to be approved by the platform admin. 

Most parts of the marketplace require KYC and therefore users have to be associated to an approved organization. You can either register a new organization or be invited to one.


## Organization Registration

In order to perform actions on the marketplace like register devices or trade certificates you have to belong to an approved organization. If you are managing the marketplace for your company, you should register a new organization.

Please provide the data in the organization registration form. The data fields used are standard KYC data that only serves as an example. The required organization data will vary on the KYY requirements of the specifc platform operator. 

Once you have provided all relevant data the organization is registerted and you are automatically the admin user. 

Users in an organization can have the roles of admin, device manager and member which gives them different permissions. Every organization has to be approved by the platform admin. 

If you are using the demo deployment, feel free to input dummy data and write a message to the EWF team if you want your user & organization approved. We will approve them asap. 


## Organization Roles

| Roles | Permissions | Notes |
| ----- | ----------- | ----- |
|   Org admin    | <ul><li>Add and remove users to the organization</li> <li>Register the organization with the issuing body (I-REC)</li> <li>Delete the organization</li> <li>Assign the admin role to other org members</li> <li>Start and accept device change of ownership</li> <li>Perform all actions tied to the organization, organization’s certificates, and organization’s devices</li>       |    <ul><li>Creator of the organization automatically becomes an organizational admin</li> <li>There can be multiple org admins</li> <li>Only members of the organization can become org admins</li> </ul>    |
|Device manager | <ul> <li>Register new devices and device groups</li> <li>Request certification </li> <li>Delete devices</li> </ul> | <ul><li> The device manager is also an org member and can perform all actions of an org member</li></ul>|
|Org Member|<ul><li>Post bids and asks</li><li>Transfer certificates</li><li>Claim certificates</li></ul>|<ul><li>Can be in multiple organizations, in each organization has a different role </li></ul>|


## Organization invitations

As an organization admin you can invite new users to the marketplace. You can enter the email and specify the role that the new organization user should have. The user will receive and email and can accept the invitation after registration. 

## Blockchain Address

There are two different blockchain addresses that are relevant for users on the marketplace.

### Exchange Deposit Address

First there is the exchange deposit address. This is the address that is used by the marketplace's integrated exchange module. Every organization has one exchange deposit address. Certificates that are deposited to this address are made available to all organization members and can be traded on the exchange. As an organization admin you should create it for all user's of the organization. The address is created and managed by the platform and you do not need to connect your own blockchain wallet. By default 

### User Blockchain Address

The second address is the user blockchain address. This address is connected to every individual user instead of the organization. It requires user to connect their own blockchain wallet. 
You can connect your blockchain wallet e.g. MetaMask: https://metamask.io/
To simplify the use of the marketplace for the user, certificates are in custody of the exchange by default. But the user can always choose to withdraw the certificates to their own blockchain account. 

Metamask has to be connected to the Volta testchain or EWC depending on the deployment: https://energyweb.atlassian.net/wiki/spaces/EWF/pages/723681315/Connecting+via+Remote+RPC+and+Metamask
