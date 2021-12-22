# Invite  
[**UI Components**](https://github.com/energywebfoundation/origin/tree/master/packages/ui/libs/organization/view/src/pages/InvitePage)

This view allows admins to invite members to the organization. A role must be selected for the invitee when the invitation is created. You can see a list of the reference implementation's roles and their privileges [here](../user-guide-reg-onboarding.md#user-roles-and-hierarchy). 

![invitationRoleSelection](../images/organization/organization-invitation.png)

When the invitation is sent, the invitee will receive the invitation in their inbox. You can view the invitation status in the Invitations list. It will be marked as “pending”, until the invitee has accepted using the email. After the invitee accepts, the invitation status will be “accepted.”