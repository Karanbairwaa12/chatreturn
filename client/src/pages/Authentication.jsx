import React, { useState } from 'react'
import Register from '../component/register/Register.jsx'
import Login from '../component/login/Login.jsx'
import { Link } from 'react-router-dom'
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import './auth.css'

const Authentication = () => {
    return (
    <>
      <div className='whatsapp-home'>
        <div className='home-container'>
          <div className='home-container-box'>
            <div className='home-container-icon'>
              <WhatsAppIcon className='icon'/>
            </div>
            <div className='home-container-para'>
              <div>
                <h1>WhatsApp Web</h1>
              </div>
              <div className="home-whatsapp-title">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</div>
            </div>
          </div>

          <div className='home-btn'>
            
            <Link to="/chat">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
              
            
          </div>
        </div>
      </div>
    </>
    
  )
}

export default Authentication
