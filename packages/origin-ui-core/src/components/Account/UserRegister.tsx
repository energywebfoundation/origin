import React from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Paper,
    FormControl,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    InputLabel,
    FilledInput,
    MenuItem
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { TextField, Select } from 'formik-material-ui';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { getUserClient } from '../../features/general/selectors';

interface IFormValues {
    titleSelect: string;
    titleInput: string;
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    password: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    titleSelect: '',
    titleInput: '',
    firstName: '',
    lastName: '',
    telephone: '',
    email: '',
    password: ''
};

const VALIDATION_SCHEMA = Yup.object().shape({
    titleSelect: Yup.string()
        .label('Title')
        .required(),
    titleInput: Yup.string().label('Title'),
    firstName: Yup.string()
        .label('First name')
        .required(),
    lastName: Yup.string()
        .label('Last name')
        .required(),
    telephone: Yup.string()
        .label('Telephone')
        .required(),
    email: Yup.string()
        .email()
        .label('Email')
        .required(),
    password: Yup.string()
        .label('Password')
        .required()
});

const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms', 'Other'];

export function UserRegister() {
    const userClient = useSelector(getUserClient);
    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await userClient.register({
                ...values,
                title: values.titleSelect === 'Other' ? values.titleInput : values.titleSelect,
                blockchainAccountAddress: '',
                blockchainAccountSignedMessage: ''
            });

            showNotification('User registered.', NotificationType.Success);
        } catch (error) {
            console.warn('Error while registering user', error);
            showNotification('Error while registering user.', NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const initialFormValues: IFormValues = INITIAL_FORM_VALUES;

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {formikProps => {
                    const { isValid, isSubmitting, values } = formikProps;

                    const isTitleValid =
                        values.titleSelect === 'Other'
                            ? Boolean(values.titleInput)
                            : Boolean(values.titleSelect);

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid || !isTitleValid;

                    return (
                        <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <InputLabel required>Title</InputLabel>
                                        <Field
                                            name="titleSelect"
                                            label="Title"
                                            component={Select}
                                            input={<FilledInput value={values.titleSelect} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                            disabled={fieldDisabled}
                                        >
                                            {TITLE_OPTIONS.map(option => (
                                                <MenuItem value={option} key={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>

                                    {values.titleSelect === 'Other' && (
                                        <FormControl
                                            fullWidth
                                            variant="filled"
                                            className="mt-3"
                                            required
                                        >
                                            <Field
                                                label="Title"
                                                name="titleInput"
                                                component={TextField}
                                                variant="filled"
                                                fullWidth
                                                required
                                                disabled={fieldDisabled}
                                            />
                                        </FormControl>
                                    )}

                                    <FormInput
                                        label="First name"
                                        property="firstName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Last name"
                                        property="lastName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        label="Email"
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Telephone"
                                        property="telephone"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

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
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                            type="password"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Register
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
