import React from 'react';
import { IDevicePermission, useTranslation } from '../../utils';
import {
    Typography,
    List,
    ListItem,
    ListItemIcon,
    Checkbox,
    ListItemText
} from '@material-ui/core';

interface IProps {
    canCreateDevice: IDevicePermission;
}

export function DevicePermissionsFeedback(props: IProps) {
    const { canCreateDevice } = props;
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="body1" className="mt-3" gutterBottom>
                {t('device.info.toRegisterADevice')}
            </Typography>
            <List>
                {canCreateDevice?.rules.map((rule) => (
                    <ListItem key={rule.label} role={undefined} dense>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={rule.passing}
                                tabIndex={-1}
                                disableRipple
                                disabled
                            />
                        </ListItemIcon>
                        <ListItemText primary={rule.label} />
                    </ListItem>
                ))}
            </List>
        </>
    );
}
