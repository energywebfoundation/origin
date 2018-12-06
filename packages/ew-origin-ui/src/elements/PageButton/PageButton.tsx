import * as React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'
import * as moment from 'moment'
import { DateRange } from 'react-date-range'
import * as datepick from '../../../assets/datepick.svg'
import * as plus from '../../../assets/plus.svg'
import '../Block/Block.scss'
import './PageButton.scss'


export class PageButton extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      itemData: null
    }

    this.handleDateRange = this.handleDateRange.bind(this)
  }

  handleDateRange(range) {

    this.setState({ itemData: range })
  }

  onItemChange = (index) => {
    const { data: { content } } = this.props
    this.setState({ itemData: content[index] })
  }

  withDropdown = (ary) => {
    const ret = ary.map(item => (`dropdown-${item}`))
    return ret.join(' ')
  }

  render() {
    const { data, onFilterOrganization } = this.props
    const { type, label, face, content } = data
    const { itemData } = this.state


    return (
      <div className={`ButtonWrapper Button--${type}`}>
        {
          type === 'dropdown' ?
            <DropdownButton
              id='org_dropddown'
              bsStyle='default'
              title={itemData || label}
              onSelect={this.onItemChange}
              className={this.withDropdown(face)}
            >
              {
                content.map((opt, index) => {
                  return (
                    <MenuItem id={'org_dropdown_' + index} key={index} onClick={() => onFilterOrganization(index)} eventKey={index}>{opt}</MenuItem>
                  )
                })
              }
            </DropdownButton>
            : type === 'date-range' ?
            <DropdownButton
              bsStyle='default'
              id='date_filter_dropddown'
              title={
                <div className='DateRangeTitle'>
                  <div className='DateLabel StartDate'>
                    <img src={datepick as any} />
                    {itemData ? moment(itemData.startDate).format('DD MMM YY') : 'Select'}
                  </div>
                  <div className='DateLabel EndDate'>
                    {itemData ? moment(itemData.endDate).format('DD MMM YY') : 'Select'}
                    <img src={plus as any} />
                  </div>
                </div>
              }
              className={'DateRange'}
            >
              <DateRange
                onInit={this.handleDateRange}
                onChange={this.handleDateRange}
              />
            </DropdownButton>
            : <div>Unkown Type</div>
        }
      </div>
    )
  }
}
