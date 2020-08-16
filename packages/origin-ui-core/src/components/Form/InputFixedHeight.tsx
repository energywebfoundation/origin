import React from 'react';
import { makeStyles, Theme, TextField } from '@material-ui/core';
import variables from '../../styles/variables.scss';

export const InputFixedHeight = ({ field, form, ...props }) => {
    const { touched, errors } = form;
    console.groupEnd();
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
            backgroundColor: `${variables.backgroundColorDarker}`
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
