import * as React from 'react'
import {
  Redirect
} from 'react-router-dom'

import { PageButton } from '../PageButton/PageButton'

import './PageContent.scss'

export class PageContent extends React.Component<any, {}> {
  render() {
    const { menu, redirectPath, onFilterOrganization } = this.props
    const PageComponent = menu.component
    const { buttons = [] } = menu || {}


    return (
      menu ?
        <div className='PageContentWrapper'>
          <div className='PageHeader'>
            <div className='PageTitle'>{menu.label}</div>
            <div className='PageButtons'>
              {
                buttons.map((button, index) => {
                  
                  return (<PageButton onFilterOrganization={onFilterOrganization} key={index} data={button} />)
                })
              }
            </div>
          </div>
          <div className='PageBody'>
            {
              menu.component ?
                <PageComponent />
                : 'Coming Soon...'
            }
          </div>
        </div>
        : <Redirect to={{ pathname: redirectPath }} />
    )
  }
}
