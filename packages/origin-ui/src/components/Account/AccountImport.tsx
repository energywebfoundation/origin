import * as React from 'react';
import {
    Paper,
    FormControl,
    Grid,
    makeStyles,
    createStyles,
    Typography,
    useTheme,
    Button,
    Divider
} from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { importAccount, clearEncryptedAccounts } from '../../features/authentication/actions';
import { getEncryptedAccounts } from '../../features/authentication/selectors';
import { dataTest } from '../../utils/Helper';

export function AccountImport() {
    const encryptedAccounts = useSelector(getEncryptedAccounts);

    const initialFormValues = {
        privateKey: '',
        password: ''
    };

    const dispatch = useDispatch();

    const onSubmit = (
        values: typeof initialFormValues,
        actions: FormikActions<typeof initialFormValues>
    ) => {
        dispatch(importAccount(values));
        actions.setSubmitting(false);
    };

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
            },
            divider: {
                marginTop: '40px'
            }
        })
    );

    const classes = useStyles(theme);

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    <Typography>
                        Please provide a private key and choose a password to securely store it.
                    </Typography>
                    <Formik
                        initialValues={initialFormValues}
                        onSubmit={onSubmit}
                        validationSchema={Yup.object().shape({
                            privateKey: Yup.string()
                                .label('Private key')
                                .required(),
                            password: Yup.string()
                                .label('Password')
                                .required()
                        })}
                    >
                        {props => {
                            const { isValid } = props;

                            return (
                                <Form {...dataTest('account-import-form')}>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('account-import-privateKey')}
                                    >
                                        <Field
                                            label="Private key"
                                            name="privateKey"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            autoComplete="off"
                                        />
                                    </FormControl>

                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                        {...dataTest('account-import-password')}
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
                                        {...dataTest('account-import-button-submit')}
                                    >
                                        Continue
                                    </Button>
                                </Form>
                            );
                        }}
                    </Formik>

                    {encryptedAccounts.length > 0 && (
                        <>
                            <Divider className={classes.divider} />
                            <Button
                                variant="contained"
                                color="default"
                                className={classes.buttonClear}
                                onClick={() => dispatch(clearEncryptedAccounts())}
                            >
                                Clear imported accounts
                            </Button>
                        </>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}
