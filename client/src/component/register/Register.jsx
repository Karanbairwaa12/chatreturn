import React, { useState } from 'react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import './register.css'
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
const Register = ({change, setChange}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    pic: "", 
  });
  const [error, setError] = useState(null); 
  const nevigate = useNavigate()
  const [show, setShow] = useState(false)
  const showPassword = (e) => {
    setShow(!show)
  }
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
   
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return; 
    }

    const myFormData = new FormData()
    myFormData.append("pic",formData.pic)
    myFormData.append("password",formData.password)
    myFormData.append("email",formData.email)
    myFormData.append("username",formData.username)

    console.log(formData.pic)
    console.log(formData.password)
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/register`,
        myFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log("response for register:",response)
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful:', response.data);
        nevigate('/chat')
      } else {
        console.error('Registration failed:', response.data);
        setError(response.data.error); 
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Email is already exist:'); 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSubmit(e); 
    }
  };
  

  return (
    <div className="register">
      <div className="register-container">
        <div className='register-body'>
          <div className="profile-pic">
            <WhatsAppIcon className='icon'/>
          </div>
          <div className="form">
            <h3>Create New Account</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-feild">
                <label htmlFor="username">Name</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="input-feild">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="input-feild">
                <label htmlFor="password">Password</label>
                <div className='passwordtype'>
                  <input
                    type={show ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                  />
                  <button onClick={showPassword} type="button">
                    {formData.password === "" ? "Show" : show ? "Hide" : "Show"}
                  </button>
                </div>
                
              </div>
              <div className="input-feild">
                <label htmlFor="pic">Upload your pic</label>
                <input
                  style={{fontSize:"12px"}}
                  type="file"
                  name="pic"
                  accept=".png, .jpg, .jpeg" // Restrict to image files
                  onChange={handleChange}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className='button'>
                 <button type="submit">Sign Up</button>
              </div>
              
            </form>
            <div className='loginroute'>
              <p>If you already registered: </p>
              <Link to='/'>
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;