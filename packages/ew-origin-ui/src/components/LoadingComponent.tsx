import React, { Component } from 'react';
import './LoadingComponent.scss';
import { CircularProgress } from '@material-ui/core';

export class LoadingComponent extends Component {
    render() {
        return (
            <div className="Loading">
                <CircularProgress className="Loading_icon" />
                <div className="Loading_message">Loading...</div>
            </div>
        );
    }
}
