import React, { Component } from 'react'
import {
  ButtonToolbar,
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

import './Block.scss'

class Block extends Component {
  constructor (props) {
    super(props)

    this.state = {
      itemData: {}
    }
  }

  onItemChange = (index) => {
    return ((k, e) => {
      const { itemData } = this.state
      itemData[index] = k
      this.setState({ itemData })
    }).bind(this)
  }

  render() {
    const { data } = this.props
    const { button, items } = data
    const { itemData } = this.state

    return (
      <div className='BlockWrapper'>
        <div className='BlockHeader'>
          <div>{data.title}</div>
          <img src={data.icon} className="Icon" />
        </div>
        <div className='BlockItems'>
          {
            items.map((item, index) => {
              return (
                <div class={`BlockItem --${item.type}`}>
                  <div class='Label'>{item.label}:</div>
                  <div class='Content'>
                    {
                      (item.type === 'label') &&
                      <div>{item.content}</div>
                    }
                    {
                      (item.type === 'select') &&
                      <DropdownButton
                        bsStyle='default'
                        title={item.content[itemData[index]] || 'Default'}
                        onSelect={this.onItemChange(index)}
                      >
                        {
                          item.content.map((opt, index) => {
                            return (
                              <MenuItem eventKey={index}>{opt}</MenuItem>
                            )
                          })
                        }
                      </DropdownButton>
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className='BlockButton' onClick={button.action} style={button.styles}>
          {button.text}
        </div>
      </div>
    )
  }
}

export default Block