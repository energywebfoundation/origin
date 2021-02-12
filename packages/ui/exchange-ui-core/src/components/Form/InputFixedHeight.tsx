import React from 'react';
import { makeStyles, Theme, TextField } from '@material-ui/core';
import { LightenColor } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';

export const InputFixedHeight = ({ field, form, ...props }) => {
    const { touched, errors } = form;
    console.groupEnd();

    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const originTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;

    const bgDarker = LightenColor(originBgColor, -3);

    const useStyles = makeStyles((theme: Theme) => ({
        error: {
            color: 'red',
            position: 'absolute',
            paddingTop: theme.spacing(1),
            paddingLeft: theme.spacing(1)
        },
        control: {
            paddingBottom: theme.spacing(6),
            position: 'relative'
        },
        input: {
            backgroundColor: bgDarker,
            caretColor: originTextColor
        }
    }));
    const styles = useStyles();

    return (
        <div className={styles.control}>
            <TextField
                {...field}
                {...props}
                fullWidth
                variant="filled"
                InputProps={{ classes: { root: styles.input, focused: styles.input } }}
            />
            {touched[field.name] && errors[field.name] && (
                <div className={styles.error}>{errors[field.name]}</div>
            )}
        </div>
    );
};
