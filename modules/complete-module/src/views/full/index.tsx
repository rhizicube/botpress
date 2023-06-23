import React from 'react'
//import ReactDOM from 'react-dom'
import ReactDom from 'react-dom'
import App from './App'
var ReactDOM = require('react-dom');
/**
 * This file is the full view of your module. It automatically includes heavy dependencies, like react-bootstrap
 * If you want to display an interface for your module, export your principal view as "default"
 */
export default class MyMainView extends React.Component {
  render() {
    return <div>Some interface <App /></div>
  }
}

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )