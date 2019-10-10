import * as React from 'react';
import {
    Paper,
    Typography,
    FormControl,
    InputLabel,
    FilledInput,
    MenuItem,
    Grid,
    useTheme,
    makeStyles,
    createStyles,
    Button
} from '@material-ui/core';
import { TextField, Select } from 'formik-material-ui';
import { useDispatch, useSelector } from 'react-redux';
import { unlockAccount, clearEncryptedAccounts } from '../../features/authentication/actions';
import { getEncryptedAccounts } from '../../features/authentication/selectors';
import { Form, Formik, Field, FormikActions } from 'formik';

import * as Yup from 'yup';

export function AccountUnlock() {
    const dispatch = useDispatch();

    const theme = useTheme();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            },
            button: {
                marginTop: '10px'
            },
            buttonClear: {
                marginTop: '40px'
            }
        })
    );

    const classes = useStyles(theme);

    const encryptedAccounts = useSelector(getEncryptedAccounts);

    const initialFormValues = {
        account: encryptedAccounts.length ? encryptedAccounts[0].address : '',
        password: ''
    };

    const onSubmit = (
        values: typeof initialFormValues,
        actions: FormikActions<typeof initialFormValues>
    ) => {
        dispatch(
            unlockAccount({
                address: values.account,
                password: values.password
            })
        );
        actions.setSubmitting(false);
    };

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    <Formik
                        initialValues={initialFormValues}
                        onSubmit={onSubmit}
                        validationSchema={Yup.object().shape({
                            account: Yup.string()
                                .label('Account')
                                .required(),
                            password: Yup.string()
                                .label('Password')
                                .required()
                        })}
                    >
                        {props => {
                            const { values, isValid } = props;

                            if (encryptedAccounts.length === 0) {
                                return (
                                    <Typography>You do not have any imported accounts.</Typography>
                                );
                            }

                            return (
                                <Form>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <InputLabel required>Account</InputLabel>
                                        <Field
                                            name="account"
                                            label="Account"
                                            component={Select}
                                            input={
                                                <FilledInput
                                                    value={values.account}
                                                    autoComplete="off"
                                                />
                                            }
                                            fullWidth
                                            variant="filled"
                                            required
                                            autoComplete="off"
                                        >
                                            {encryptedAccounts.map(option => (
                                                <MenuItem
                                                    value={option.address}
                                                    key={option.address}
                                                >
                                                    {option.address}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            label="Password"
                                            name="password"
                                            component={TextField}
                                            variant="filled"
                                            type="password"
                                            fullWidth
                                            required
                                            autoComplete="off"
                                        />
                                    </FormControl>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={!isValid}
                                        className={classes.button}
                                    >
                                        Unlock
                                    </Button>
                                </Form>
                            );
                        }}
                    </Formik>
                    {encryptedAccounts.length > 0 && (
                        <Button
                            variant="contained"
                            color="default"
                            className={classes.buttonClear}
                            onClick={() => dispatch(clearEncryptedAccounts())}
                        >
                            Clear imported accounts
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}
