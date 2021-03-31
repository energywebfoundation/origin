import React, { memo } from 'react';
import LoginPageImage from '../../assets/bg-origin.png';

export const LoginPageBackground = memo(() => (
    <img alt={'login page background'} className="LoginPageBackground" src={LoginPageImage} />
));

LoginPageBackground.displayName = 'LoginPageBackground';
