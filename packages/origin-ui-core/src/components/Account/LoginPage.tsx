import React from 'react';
import { LoginForm } from './LoginForm';
// import BgOrigin from '../../../assets/bg-origin.png';

interface IOwnProps {
    redirect?: string;
}

export const LoginPage = (props: IOwnProps) => {
    return (
        <div className="LoginPage">
            <LoginForm redirect={props.redirect} />
        </div>
    );
};
