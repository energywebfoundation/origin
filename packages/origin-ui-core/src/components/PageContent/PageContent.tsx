import React from 'react';
import { Redirect } from 'react-router-dom';

export class PageContent extends React.Component<any, any> {
    render() {
        const { menu, redirectPath, props } = this.props;
        const PageComponent = menu.component;

        return menu ? (
            <div className="PageContentWrapper">
                <div className="PageBody">
                    {menu.component ? <PageComponent {...props} /> : 'Coming Soon...'}
                </div>
            </div>
        ) : (
            <Redirect to={{ pathname: redirectPath }} />
        );
    }
}
