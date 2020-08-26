import React from 'react';
import { IRECConnectOrRegisterStep } from './IRECConnectOrRegisterStep';
import { IRECConnectForm } from './IRECConnectForm';
import { IRECRegisterForm } from './IRECRegisterForm';
import { OrganizationRegistrationCompletedStep } from './OrganizationRegistrationCompletedStep';
import { PlatformOrganizationRegistrationForm } from './PlatformOrganizationRegistrationForm';

export enum STEP_NAMES {
    REGISTER_ORGANIZATION = 0,
    CONNECT_OR_CREATE = 1,
    CONNECT_IREC = 2,
    REGISTER_IREC = 3,
    REGISTRATION_COMPLETED = 4
}

export const OrganizationRegistrationStepper = () => {
    const [activeStep, setActiveStep] = React.useState<STEP_NAMES>(
        STEP_NAMES.REGISTER_ORGANIZATION
    );

    const steps = (stepName: STEP_NAMES) => {
        switch (stepName) {
            case STEP_NAMES.REGISTER_ORGANIZATION:
                return <PlatformOrganizationRegistrationForm nextStep={setActiveStep} />;
            case STEP_NAMES.CONNECT_OR_CREATE:
                return <IRECConnectOrRegisterStep nextStep={(step) => setActiveStep(step)} />;
            case STEP_NAMES.CONNECT_IREC:
                return <IRECConnectForm />;
            case STEP_NAMES.REGISTER_IREC:
                return <IRECRegisterForm nextStep={setActiveStep} />;
            case STEP_NAMES.REGISTRATION_COMPLETED:
                return <OrganizationRegistrationCompletedStep />;
        }
    };

    return steps(activeStep);
};
