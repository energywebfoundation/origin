import React from 'react';
import { useTranslation, IPermission } from '../utils';
import {
    Typography,
    List,
    ListItem,
    ListItemIcon,
    Checkbox,
    ListItemText
} from '@material-ui/core';

interface IProps {
    canAccessPage: IPermission;
}

export function PermissionsFeedback(props: IProps) {
    const { canAccessPage } = props;
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="body1" className="mt-3" gutterBottom>
                {t('info.needToFulfilCriteria')}
            </Typography>
            <List>
                {canAccessPage?.rules.map((rule) => (
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
