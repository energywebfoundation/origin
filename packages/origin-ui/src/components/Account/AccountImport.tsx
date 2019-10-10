import * as React from 'react';
import {
    Paper,
    FormControl,
    Grid,
    makeStyles,
    createStyles,
    Typography,
    useTheme,
    Button
} from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { importAccount } from '../../features/authentication/actions';

export function AccountImport() {
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
                            const { isValid, values } = props;

                            console.log('render', {
                                isValid,
                                values
                            });

                            return (
                                <Form>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
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
                                        Continue
                                    </Button>
                                </Form>
                            );
                        }}
                    </Formik>
                </Grid>
            </Grid>
        </Paper>
    );
}
