import React from 'react';
import { ErrorOutline } from '@material-ui/icons';
import { useOriginConfiguration } from '../../utils/configuration';

interface IProps {
    message: string;
}

export function ErrorComponent(props: IProps) {
    const textColorDefault = useOriginConfiguration()?.styleConfig?.TEXT_COLOR_DEFAULT;

    return (
        <div className="Error" style={{ color: textColorDefault }}>
            <ErrorOutline className="Error_icon" />
            <div className="Error_message">{props.message}</div>
        </div>
    );
}
