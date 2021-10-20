# Organization
https://origin-ui-canary.herokuapp.com/organization/my  

An [Organization](./user-guide-reg-onboarding.md#organizations) is the top level of user-hierarchy in the Origin platform.  

The Organization interface allows you to manage and invite members to your organization, and to request I-REC API access for your organization. **In the reference implementation, this interface is only visible to users with Admin privileges**. 

See the Origin packages related to Organization management on github [here](https://github.com/energywebfoundation/origin/tree/master/packages/organizations). 


## My Organization

## Members

## Invitations

## Invite  
https://origin-ui-canary.herokuapp.com/organization/invite  

This view allows admins to invite members to the organization. A role must be selected for the invitee when the invitation is created. You can see a list of the reference implementation's roles and their privileges [here](./user-guide-reg-onboarding.md#user-roles-and-hierarchy). 

[!invitationRoleSelection](images/organization/organization-invitation.png)

When the invitation is sent, the invitee will receive the invitation in their inbox. You can view the invitation status in the Invitations list. It will be marked as “pending”, until the invitee has accepted using the email. After the invitee accepts, the invitation status will be “accepted.”




