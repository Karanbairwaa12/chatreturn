import React, { useState } from 'react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../register/register.css'
import { Link } from 'react-router-dom';
const Login = ({handleLogin}) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null); 
  const [show, setShow] = useState(false)
  const showPassword = (e) => {
    setShow(!show)
  }
  const handleChange = (e) => {
    const { name, value} = e.target;
    
   
      setFormData({
        ...formData,
        [name]: value,
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    console.log(formData)
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
        console.log("response",response)
      if (response.status === 200 || response.status === 201) {
        console.log('Login successful:', response.data.other);
        console.log('Login successful:', response.data.accessToken);
        localStorage.setItem('token', response.data.accessToken);
        // console.log(localStorage)
        handleLogin(response.data); 
      }else {
        console.error('Login failed:', response.data);
        setError(response.data.error || 'Login failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred during login.');
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
            <h3>Login Account</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-feild">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
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
                  />
                  <button onClick={showPassword}type="button">
                    {formData.password === "" ? "Show" :show ? "Hide" : "Show"}
                  </button>
                </div>
                
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className='button'>
                 <button button type="submit">Login</button>
              </div>
              
            </form>
            <div className='loginroute'>
              <p>Create an Account: </p>
              <Link to="/register">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;