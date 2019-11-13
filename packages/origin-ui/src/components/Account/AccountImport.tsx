import React from 'react';
import {
    Paper,
    FormControl,
    Grid,
    makeStyles,
    createStyles,
    Typography,
    useTheme,
    Button,
    Divider,
    Link
} from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import { TextField } from 'formik-material-ui';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { importAccount, clearEncryptedAccounts } from '../../features/authentication/actions';
import { getEncryptedAccounts } from '../../features/authentication/selectors';
import { dataTest } from '../../utils/helper';
import { showRequestPasswordModal } from '../../features/general/actions';

export function AccountImport() {
    const encryptedAccounts = useSelector(getEncryptedAccounts);

    const initialFormValues = {
        privateKey: ''
    };

    const dispatch = useDispatch();

    const onSubmit = (
        values: typeof initialFormValues,
        actions: FormikActions<typeof initialFormValues>
    ) => {
        dispatch(
            showRequestPasswordModal({
                title: 'Set password',
                callback: (password: string) => {
                    dispatch(
                        importAccount({
                            privateKey: values.privateKey,
                            password
                        })
                    );
                    actions.resetForm();
                }
            })
        );

        actions.setSubmitting(false);
    };

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            },
            button: {
                marginTop: '20px'
            },
            buttonClear: {
                marginTop: '40px'
            },
            divider: {
                marginTop: '40px'
            },
            loadKeystoreContainer: {
                textAlign: 'center',
                lineHeight: '56px'
            },
            information: {
                paddingBottom: '20px'
            },
            fileUploadInput: {
                display: 'none'
            }
        })
    );

    const classes = useStyles(useTheme());

    function handleKeystoreUpload(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onload = event => {
            const keystore = event.target.result;

            if (typeof keystore !== 'string') {
                return;
            }

            dispatch(
                showRequestPasswordModal({
                    title: 'Unlock keystore',
                    callback: (password: string) => {
                        dispatch(
                            importAccount({
                                privateKey: keystore,
                                password
                            })
                        );
                    }
                })
            );
        };
    }

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    <Typography className={classes.information}>
                        Paste a private key or load a keystore file. <br />
                    </Typography>
                    <Formik
                        initialValues={initialFormValues}
                        onSubmit={onSubmit}
                        validationSchema={Yup.object().shape({
                            privateKey: Yup.string()
                                .label('Private key')
                                .required()
                        })}
                    >
                        {props => {
                            const { isValid } = props;

                            return (
                                <Form {...dataTest('account-import-form')}>
                                    <Grid container>
                                        <Grid item xs={6}>
                                            <FormControl
                                                fullWidth
                                                variant="filled"
                                                required
                                                {...dataTest('account-import-privateKey')}
                                            >
                                                <Field
                                                    label="Private key"
                                                    name="privateKey"
                                                    component={TextField}
                                                    variant="filled"
                                                    fullWidth
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
                                        </Grid>
                                        <Grid item xs={6} className={classes.loadKeystoreContainer}>
                                            <input
                                                className={classes.fileUploadInput}
                                                id="contained-button-file"
                                                type="file"
                                                onChange={e => handleKeystoreUpload(e.target.files)}
                                            />
                                            <label htmlFor="contained-button-file">
                                                <Button
                                                    startIcon={<CloudUpload />}
                                                    component="span"
                                                    variant="outlined"
                                                >
                                                    Load keystore
                                                </Button>
                                            </label>
                                            <br />
                                            <Link
                                                href="https://kb.myetherwallet.com/en/security-and-privacy/what-is-a-keystore-file/"
                                                target="_blank"
                                                rel="noopener"
                                                color="textSecondary"
                                            >
                                                What is a keystore file?
                                            </Link>
                                        </Grid>
                                    </Grid>
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
