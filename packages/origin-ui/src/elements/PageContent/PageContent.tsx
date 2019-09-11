import * as React from 'react';
import { Redirect } from 'react-router-dom';

import './PageContent.scss';

export class PageContent extends React.Component<any, {}> {
    render() {
        const { menu, redirectPath } = this.props;
        const PageComponent = menu.component;

        return menu ? (
            <div className="PageContentWrapper">
                <div className="PageBody">
                    {menu.component ? <PageComponent /> : 'Coming Soon...'}
                </div>
            </div>
        ) : (
            <Redirect to={{ pathname: redirectPath }} />
        );
    }
}
