import { connect } from 'formik';
import { useEffect, useRef } from 'react';

function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}

const FormikEffectComponent = ({
    onChange,
    formik
}: {
    onChange: (values: any) => void;
    formik?: any;
}) => {
    const { values } = formik;
    const prevValues = usePrevious(values);

    useEffect(() => {
        if (prevValues && onChange) {
            onChange(values);
        }
    }, [values]);

    return null;
};

export const FormikEffect = connect(FormikEffectComponent);
