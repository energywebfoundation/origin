import { useTranslation } from 'react-i18next';
import React, { memo } from 'react';
import { Grid, Theme, Tooltip, Typography, withStyles } from '@material-ui/core';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';
import { useUserInfo } from '@energyweb/origin-ui-core';

const LightTooltip = withStyles((theme: Theme) => ({
    arrow: {
        color: theme.palette.primary.main
    },
    tooltip: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white
    }
}))(Tooltip);

const Dot = memo((props) => (
    <span
        style={{
            backgroundColor: 'rgb(255,215,0)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            display: 'inline-block',
            marginLeft: '4px'
        }}
        {...props}
    />
));

Dot.displayName = 'Dot';

export const UsernameAndOrg = () => {
    const { t } = useTranslation();
    const { user } = useUserInfo();

    return (
        <Grid className="userNameAndOrg">
            <Typography variant="h6">
                {user?.status === UserStatus.Pending && (
                    <LightTooltip arrow title={t('user.popover.yourAccountIsPending')}>
                        <span>
                            <Dot data-cy="user-pending-badge" />
                        </span>
                    </LightTooltip>
                )}
                <span>
                    {user?.firstName} {user?.lastName}
                </span>
            </Typography>
            <Typography>
                {user?.organization?.status === OrganizationStatus.Submitted && (
                    <LightTooltip arrow title={t('user.popover.yourOrganizationIsPending')}>
                        <span>
                            <Dot data-cy="organization-pending-badge" />
                        </span>
                    </LightTooltip>
                )}
                <span>{user?.organization ? `${user.organization.name}` : ''}</span>
            </Typography>
        </Grid>
    );
};
