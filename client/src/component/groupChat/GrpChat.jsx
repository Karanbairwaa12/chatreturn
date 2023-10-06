import React, { useEffect, useState,useRef } from 'react'
import GroupsIcon from '@mui/icons-material/Groups';
import '../mychat/mychat.css';
import axios from 'axios';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BinaryImage from '../BinaryImage';

const GrpChat = ({ socket, userData, selectedChat, user, handleProfile }) => {
  // console.log("grpChat socket:",socket)
  const [loggedUser, setLoggedUser] = useState([])
  const [inputMsg, setInputMsg] = useState("")
  const [message, setMessage] = useState({ data: [] });
  const [dropDown, setdropDown] = useState(false)
  
  const [isRemoveMessage, setIsRemovemessage] = useState(false)
  const [index, setIndex] = useState(0)
  const chatBodyRef = useRef();

  let myUser = selectedChat

  console.log("this is my myUser:",myUser)
  const handleSubmit = (event) =>{
    setInputMsg(event.target.value)
    console.log("handleSubmt",message)
  
  }


 const fetchMessages = async() => {
  try {
    const config ={
      headers: {
        Authorization:`Bearer ${userData.accessToken}`
      }
    }

    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/message/${selectedChat._id}`, config);
    const responseData = response.data;

    // console.log("this is the message I want", responseData);

    setMessage({ data: responseData });
    // console.log("responseData:",responseData)
  } catch (err) {
    console.log(err);
  }
}
const [seeChanges, setSeeChanges] = useState(false)
const sendMessage = async () => {
  try {
    const config = {
      headers: {
        "Content-Type":"application/json",
        Authorization:`Bearer ${userData.accessToken}`
      }
    }
    setInputMsg("")
    const {data} = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/message`,
      {
        content:inputMsg,
        chatId: selectedChat._id,
      },
      config
    )

    // console.log("this is msg",data)
    

  
    await socket.emit("new_group_message", data);
  setMessage((prevState) => {
    return {
      data: [...prevState.data, data],
    };
  });
  setSeeChanges(!seeChanges)
  
  }catch(err) {
    
  }
}
  
useEffect(()=> {
  fetchMessages()
  // console.log("useEffect set message",message)
  
},[selectedChat])

useEffect(() => {
  const chatBody = document.getElementById('chat-body');
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}, [message.data]);


// useEffect(() => {
//  handleRemoveMsg()
// });



useEffect(()=> {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    // console.log("hi",storedUserData)
    // console.log("hello",JSON.parse(storedUserData))
    setLoggedUser(JSON.parse(storedUserData));
  }
  // fetchChats()
  // selectedChatCompare = selectedChat
},[selectedChat])

useEffect(() => {
  const handleReceiveMessage = (data) => {
    console.log("Received receive_group_message:", data);
    const isMessageAlreadyExists = message.data.some((item) => item._id === data._id);

    if (!isMessageAlreadyExists) {
      setMessage((prevState) => {
        return {
          data: [...prevState.data, data],
        };
      });
    }
  };

  socket.on("receive_group_message", handleReceiveMessage);

  return () => {
    socket.off("receive_group_message", handleReceiveMessage);
  };
},[seeChanges]);

useEffect(()=> {
  chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
})
  return (
    // <div>
    //   {console.log("this is handle grpchat",socket,userData,selectedChat,user,handleProfile)}
    // </div>

    <div className='chat-left'>
      <div className='left-container'>
        <div className='right-container-navbar'>
          <div className='nav-container'>
            <div className='profile'>
              {
                myUser && myUser.length !== 0 && (
                  <div className='nav-profile-pic'>
                    {/* <img src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" alt="" />
                     */}
                    {
                      myUser.pic && (
                        <BinaryImage contentType={myUser.pic.contentType} data={myUser.pic.data.data} />
                      )
                    }
                  </div>
                )
                
              }
              
              <div className='selected-user-name'>
              
                {/* <h3>{myUser.chatName? myUser:`Group`}</h3> */}
                <h3>group</h3>
              </div>
              
            </div>
            <div className='group-others'>
              <div className='group-icons'>
                {/* <GroupsIcon className ="grpicons"/> */}
                {
                myUser && myUser.length !== 0 && (
                  <MoreVertIcon className='grpicons' onClick={()=> setdropDown(!dropDown)}/>
                )
                
              }
                
                    {
                      dropDown && (
                        <div className='dropdown'>
                          <div className='dropBtn' onClick={handleProfile}>
                            profile
                          </div>
                        </div>
                      )
                    }
                
                
              </div>
            </div>
          </div>
        </div>
        
        <div className='chat-body' ref={chatBodyRef}>
          {/* {console.log(message.data)} */}
        {message.data && message.data.map((item, i) => {
          const isMyMessage = item.sender._id === userData.other._id;
          const messageContainerClass = isMyMessage ? 'message right-message' : 'message left-message';

          return (
            <div className={messageContainerClass} key={i} onClick={() => setIsRemovemessage(false)}>
              {/* id={username === item.author ?"you":"other"} */}
              <div className="message-container"  >
                <div className='message-content'>
                  <p>{item.content}</p>
                  <div className='message-meta'>
                    <div className='time'>{item.createdAt.substring(11, 16)}</div>  {/* Assuming you have a createdAt property */}
                  </div>
                  {/* {
                    isRemoveMessage && index === i && item.sender._id === userData.other._id && (
                      <div className='dropdownRemove'>
                        <div className='dropBtn' onClick={()=> handleRemoveMsg(item)}>
                          remove
                        </div>
                      </div>
                    )
                  }   */}
                </div>
               
              </div>
            </div>
            
          );
        })}
        
      </div>
      <div className="chat-footer">
      {
        myUser && myUser.length !== 0 && (
          <div className='chat-footer-container'>
            <input type="text" placeholder='Hey...'
            value={inputMsg}
            onChange={(event)=> {
              handleSubmit(event)
            }}
            onKeyPress={(event) => {
              if (event.key === "Enter" || event.keyCode === 13) {
                sendMessage()
              }
            }}
            />
        </div>  
        )
        
      }
        
      </div>
      </div>
    </div>
  )
  
}

export default GrpChat
