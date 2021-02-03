import { connect } from 'formik';
import { useEffect } from 'react';
import { usePrevious } from '@energyweb/origin-ui-core';

function FormikEffectComponent<T extends any>({
    onChange,
    formik
}: {
    onChange: (values: T) => void;
    formik?: any;
}) {
    const values = formik?.values;
    const prevValues = usePrevious(values);

    useEffect(() => {
        if (prevValues && onChange) {
            onChange(values);
        }
    }, [values]);

    return null;
}

export const FormikEffect: any = connect(FormikEffectComponent);
