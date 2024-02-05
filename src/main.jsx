import React, { useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Header from './Header.jsx';
// import Steal from './thief_wordle.jsx'
import "./main.css";



ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <Header />
    <App />
    {/* <Steal />  */}
  </React.StrictMode>

);




