import React from 'react';
import { Redirect } from 'react-router-dom';

export const PageContent = (props: any) => {
    const { menu, redirectPath } = props;

    const pageComponentTemplate = () => {
        if (menu.component) {
            const PageComponent = menu.component;
            return <PageComponent {...menu.props} {...props} />;
        } else if (menu.render) {
            return menu.render();
        } else return <div>Coming soon...</div>;
    };

    return menu ? (
        <div className="PageContentWrapper">
            <div className="PageBody">{pageComponentTemplate()}</div>
        </div>
    ) : (
        <Redirect to={{ pathname: redirectPath }} />
    );
};
