import React, { Component } from 'react';
import './ErrorComponent.scss';
import { ErrorOutline } from '@material-ui/icons';

interface IProps {
    message: string;
}

export class ErrorComponent extends Component<IProps> {
    render() {
        return (
            <div className="Error">
                <ErrorOutline className="Error_icon" />
                <div className="Error_message">{this.props.message}</div>
            </div>
        );
    }
}
