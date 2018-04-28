import React, { Component } from 'react'
import MemeList from "../components/MemeList/MemeList";

export default class Home extends Component {
  render () {
    const style = {
        display: 'flex', /* or inline-flex */
        justifyContent: 'center',
        alignItems: 'center',
        width:"100%"
    };
    return (
      <div style={style}>
        <MemeList/>
      </div>
    )
  }
}