import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Home from './pages/Home';
// import Register from './pages/Register.jsx';
import Authentication from './pages/Authentication';
import Login from './component/login/Login';
import Register from './component/register/Register';
import { useEffect, useState } from 'react';
import ChatPage from './component/chatpage/ChatPage';


function App() {
  const storedUserData = JSON.parse(localStorage.getItem('userData'));
  // console.log("storeUserData",storedUserData)
  const [isLoggedIn, setIsLoggedIn] = useState(!!storedUserData);
  const [userData, setUserData] = useState(storedUserData || {});
  const [backendPath, setBackendPath] = useState("http://localhost:8081/public/")

  // Function to set the login state and store user data
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserData(data);

    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(data));
  };

  // Function to set the logout state and clear user data from localStorage
  const handleLogout = (personChat,setPersonChat) => {
    setIsLoggedIn(false);
    setPersonChat(false);

    // Remove the personChat value from localStorage
    localStorage.removeItem('personChat');
    // Clear user data from localStorage
    localStorage.removeItem('userData');  
  };

  useEffect(() => {
    // const storedToken = localStorage.getItem('token');
    // if (storedToken) {
    //   setIsLoggedIn(true);
    // }

    // Retrieve user data from localStorage, if available
    console.log(isLoggedIn)
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      // console.log("hi",storedUserData)
      // console.log("hello",JSON.parse(storedUserData))
      setUserData(JSON.parse(storedUserData));
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route
            exact
            path="/"
            element={<Authentication/>}
        />
        <Route
          exact
          path="/chat"
          element={isLoggedIn ? <ChatPage backendPath={backendPath} userData = {userData} handleLogout={handleLogout}/> : <Home handleLogin={handleLogin} isLoggedIn={isLoggedIn}/>}
        />
        <Route exact path="/register" element={<Register/>} />
      </Routes>
    </Router>
  );
}

export default App;
