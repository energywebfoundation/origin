import React, { Component } from 'react';
import './ErrorComponent.scss';
import { ErrorOutline } from '@material-ui/icons';

interface Props {
    message: string;
}

export class ErrorComponent extends Component<Props> {
    render() {
        return (
            <div className="Error">
                <ErrorOutline className="Error_icon" />
                <div className="Error_message">{this.props.message}</div>
            </div>
        );
    }
}
