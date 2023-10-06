import React from 'react'
import Login from '../component/login/Login'
import ChatPage from '../component/chatpage/ChatPage.jsx'
const Home = ({handleLogin,isLoggedIn}) => {
  return (
    <div>
      {isLoggedIn ? (
        // Display a welcome message or any other content for logged-in users
        <ChatPage/>
      ) : (
        // Display the login component
        <Login handleLogin={handleLogin} />
      )}
    </div>
  )
}

export default Home