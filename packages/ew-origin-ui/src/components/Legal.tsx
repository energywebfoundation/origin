// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react'
import { Nav } from 'react-bootstrap'
import FadeIn from 'react-fade-in'
import * as renderHTML from 'react-render-html'

import '../../assets/common.scss'
import './Legal.scss'

export class Legal extends React.Component<{}, {}> {
  render() {
    const LegalTexts = [
      'Copyright 2018 Energy Web Foundation',
      '',
      'This application is part of the Origin Application brought to you by the Energy Web Foundation,',
      'a global non-profit organization focused on accelerating blockchain technology across the energy sector, ',
      'incorporated in Zug, Switzerland.',
      '',
      'The Origin Application is free software: you can redistribute it and/or modify',
      'it under the terms of the GNU General Public License as published by',
      'the Free Software Foundation, either version 3 of the License, or',
      '(at your option) any later version.',
      '',
      'This is distributed in the hope that it will be useful,',
      'but WITHOUT ANY WARRANTY and without an implied warranty of',
      'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.',
      '',
      `See the GNU General Public License for more details, at <a href='http://www.gnu.org/licenses/'>http://www.gnu.org/licenses/</a>.`,
    ]
    return (
      <div className='PageWrapper'>
        <div className='PageNav'></div>

        <div className='PageContentWrapper'>
          <div className='PageHeader'>
            <div className='PageTitle'>Legal</div>
          </div>
          <div className='PageBody'>
            {
              LegalTexts.map((text, index) => {
                return (
                  <div key={index} className="Line">
                    {renderHTML(text)}<br />
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>
    )
  }
}
