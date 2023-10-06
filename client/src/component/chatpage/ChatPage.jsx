import React, { useEffect, useState } from 'react'
import '../../pages/auth.css'
import './chatpage.css'
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupsIcon from '@mui/icons-material/Groups';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import MyChat from '../mychat/MyChat';
import CloseIcon from '@mui/icons-material/Close';
import io from 'socket.io-client'
import BinaryImage from '../BinaryImage';
import GrpChat from '../groupChat/GrpChat';
// import { set } from 'mongoose';

const socket = io.connect("http://localhost:9002")
const ChatPage = ({userData,handleLogout,backendPath}) => {

  const [dropDown, setdropDown] = useState(false)
  const [search, setSearch] = useState(localStorage.getItem('search') || '');
  const [searchResult,setSearchResult] = useState([])
  const [error, setError] = useState(null); 
  const [loding, setLoding] = useState()
  const [selectedChat, setSelectedChat] = useState([])
  const [otherUser, setOtherUser] = useState([])
  const [personChat, setPersonChat] = useState(
    localStorage.getItem('personChat') === 'true' || false // Retrieve from localStorage
  );
  const [withoutSaerchRslt, setWithoutSearchRslt] = useState([])
  const [newchat, setNewChat] = useState([])
  const [profileCheck, setProfileCheck] = useState(false)
  const [logedUserProfilecheck,setLogedUserProfilecheck] = useState(false)
  const [group, setGroup] = useState(false)
  const [groupName,setGroupName] = useState("")

  // console.log("first",userData)
  const handleProfile = () => {
    setProfileCheck(true)
  }

  const handleLogedProfile =()=> {
    setLogedUserProfilecheck(false)
    setdropDown(false)
  }
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && search.trim() !== "") { // Check if search is not empty
      handleUsers();
      // console.log("search", search);
    }else {
      setSearchResult([])
    }
  };
  const handleUsers = async () => {
    if (!search) {
      // console.log(search)
      setSearch('');
      localStorage.removeItem('search'); // Clear search from localStorage
      return; // Return early if search is empty
    }

    try {
      // console.log("accessToken",userData.accessToken)
      const config = {
          headers: {
            Authorization :`Bearer ${userData.accessToken}`
          }
      }
      setLoding(true)
      // console.log("this is the data I want to fetch")
      const {data} = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user?search=${search}`,config)
      // console.log("data")
      // console.log("search data",data)
      setLoding(false)
      setSearchResult(data)
      localStorage.setItem('search', search);
    }catch(err) {
      console.error('Error during login:', err);
      setError('An error occurred during login.');
    }
  }
  // console.log("userData", userData)
  
  const joinRoom =(chat)=> {
    // console.log("join room",chat._id)
    if(chat._id !== "") {
      socket.emit("join_room",chat._id)
    }
    
  }
  const accessChat = async (itemData) => {
    // console.log("this is userId", userId);
    // console.log(chats)
    let userId = itemData._id
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${userData.accessToken}`,
        },
      };
      // console.log(userData.accessToken);
      if(itemData.isGroupChat) {
        console.log("it is grp chat official")
        const existingChat = newchat.find((chat) =>chat.users.some((user) => user._id === userId));
        console.log(existingChat)
        if(!existingChat) {
          console.log("this is group chat",userId)
          const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/group/${userId}`, config);
          // console.log("chats data:", data)
        
          setNewChat([...newchat,data])
          
          setSelectedChat(data);// Set the new chat as the selected chat
          setOtherUser(data)
          console.log("this is selected group User:",data)
        }else {
          console.log("if existing user already parsent")
          setSelectedChat(existingChat);
          setOtherUser(existingChat)

          console.log("this is group chat which is already parsent in selectedchats:",existingChat)
        }
      }else {
        let dataId = itemData._id
        console.log("this is not a grp chat",newchat)

        const existingChat = newchat.find((chat) =>chat.users.some((user) => user._id === dataId));
        console.log(existingChat,itemData,"this is already parsent")
        
        console.log(existingChat,dataId,"this is already parsent")
        if(!existingChat) {
          console.log(userId)
            const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat/one`, { userId }, config);
            // console.log("chats data:", data)

            setNewChat([...newchat,data])
            
            setSelectedChat(data);// Set the new chat as the selected chat
            const namiUser = data.users.find(user => user._id === userId);

            if (namiUser) {
                setOtherUser(namiUser)
                console.log("Nami's data:", namiUser);
            } else {
                console.log("Nami not found in the users array.");
            }
        }else {
          console.log("already parsent")
          setSelectedChat(existingChat);
          const namiUser = existingChat.users.find(user => user._id === userId);
          console.log(namiUser)
          if (namiUser) {
              setOtherUser(namiUser)
              console.log("Nami's data:", namiUser);
          } else {
              console.log("Nami not found in the users array.");
          }
        }
      }
      // console.log("existingChat", existingChat);
      setPersonChat(true);
  
      
    } catch (err) {
      
      setError('An error occurred');
  
      
      setPersonChat(false);
    }
  };
  useEffect(() => {
    // console.log("selected chat", selectedChat);
    // console.log("this is other user", otherUser)
    joinRoom(selectedChat)
  }, [selectedChat]);
  
  useEffect(() => {
   handleUsers()
  }, [search]);

  useEffect(() => {
    
    localStorage.setItem('personChat', JSON.stringify(personChat));
  }, [personChat]);

  useEffect(() => {
    
    const storedPersonChat = localStorage.getItem('personChat');
    // console.log("storePersonChat",storedPersonChat)
    if (storedPersonChat) {
      
      setPersonChat(JSON.parse(storedPersonChat));
    }
  }, [personChat]);

  
  useEffect(() => {
    if (!search) {
      const fetchChatsWithLastMessages = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
            },
          };
  
          
          const chatResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/one`, config);
          const chatData = chatResponse.data;
          // console.log("chatData from chat Response",chatData)
          
          const chatsWithLastMessages = [];
  
          
          for (const chat of chatData) {
            
            const chatMessagesUrl = `${process.env.REACT_APP_API_BASE_URL}/message/${chat._id}`;
  
            
            const messageResponse = await axios.get(chatMessagesUrl, config);
            // console.log(`this is messageResponse`,messageResponse)
            const messageData = messageResponse.data;
            // console.log("this is messageData",messageData)
            // console.log("this is messageData",messageData)
            
            if (messageData.length > 0) {
              
              chatsWithLastMessages.push(chat);
            }
          }

          
          const usersNotMatchingId = chatsWithLastMessages.flatMap((chat) =>
            chat.users.filter((user) => user._id !== userData.other._id)
          );

         console.log("this is userNotMatchingId",usersNotMatchingId)
          const fetchChatsData =await fetchChats()
          console.log("this is fetchChatsData",fetchChatsData)
          
          // const array = Array.from(new Set(usersNotMatchingId.map(obj => obj.id))).map(id => {
          //   return usersNotMatchingId.find(obj => obj.id === id);
          // });

          // console.log(array)
          // const removeDuplicate =Array.from(new Set(array.map(obj => obj.id))).map(id => {
          //   return array.find(obj => obj.id === id);
          // });

          const uniqueObjects = [];
          const seenUsernames = new Set();

          for (const obj of usersNotMatchingId) {
            if (!seenUsernames.has(obj.email)) {
              seenUsernames.add(obj.email);
              uniqueObjects.push(obj);
            }
          }

          console.log(uniqueObjects);
          
          setWithoutSearchRslt([...uniqueObjects,...fetchChatsData]);
          // setWithoutSearchRslt((prevData) => [...prevData, ...filteredChats]);
        } catch (error) {
          console.error('Error fetching chats with last messages:', error);
          setError('An error occurred while fetching chats.');
        }
      };
  
      
      fetchChatsWithLastMessages();
    }
  }, [search, userData.accessToken, setWithoutSearchRslt]);

  const [selecteUserForGroup, setSelecteUserForGroup] = useState([]) 
  const [changeState, setChangeState] = useState(false)
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`,
        },
      };
  
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/chat/one`,
        config
      );
  
      if (response.status === 200) {
        const allChats = response.data;
        // Now you have all the chats including group and single chats in 'allChats' array.
        // You can proceed to filter the group chats and check if 'userData.other._id' is included in 'chat.users'.
        const groupChats = allChats.filter((chat) => chat.isGroupChat);
        
        const filteredChats = groupChats.filter((chat) =>
          chat.users.some((user) => user._id === userData.other._id)
        );
  
        // 'filteredChats' now contains all group chats where 'userData.other._id' is included.
        // You can update your state (e.g., setWithoutSearchRslt) with this filtered result.
        // console.log("filter chats",filteredChats)
        return filteredChats
        // setWithoutSearchRslt((prevData) => [...prevData, ...filteredChats]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('An error occurred while fetching chats.');
    }
  };
  const handleSelecteUserForGroup =(item)=> {
    const existingUserInSelected = selecteUserForGroup.find((user) => user._id === item._id)

    if(!existingUserInSelected) {
      setSelecteUserForGroup((prevSelectedUsers) => [...prevSelectedUsers, item]);  
    }else {
      console.log("already parsent")
    }
  }

  const handleCreateGroupChat =async()=> {
    try {
      if (groupName.trim() !== '' && selecteUserForGroup.length >= 2) {
        // Create the group chat configuration
        const groupChatConfig = {
          chatName: groupName,
          users: selecteUserForGroup.map(user => user._id),
        };
  
        // Set the request headers with the user authentication token
        const config = {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            'Content-Type': 'application/json',
          },
        };
  
        // Make an API call to create the group chat using Axios
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat/group`, groupChatConfig, config);
  
        if (response.status === 201 || response.status === 200) {
          // Handle success, e.g., show a success message or redirect to the created group chat
          // console.log('Group chat created successfully',response);
          // setError(false)
          setSelecteUserForGroup([]);
          setSearchResult([]);
          setGroupName('');
          setSearch("")
          setGroup(false)
          setChangeState(!changeState)
        } else {
          // Handle other status codes as needed
          console.error('Failed to create group chat');
        }

        
      } else {
        // Handle the case where the group name is empty or there are not enough selected users
        console.log('Group name is empty or not enough selected users');
      }
    }catch(error) {
      console.log("these is some error",error)
    }
  }
  const handleResetAllThings =()=> {
    setGroupName("")
    setSearch("")
    setGroup(false)
  }
  const handleRemoveSelecteUser = (userToRemove) => {
    const updatedSelectedUsers = selecteUserForGroup.filter((user) => user._id !== userToRemove._id);
    setSelecteUserForGroup(updatedSelectedUsers);
  };

  useEffect(()=> {
    try{

    }catch(error) {
      console.log("this is the error",error)
    }
  }, [search, userData.accessToken, setWithoutSearchRslt])
  return (
    
    <div className='chatpage'>
      {
        group && 
          <div className='group'>
              <div className='groupContainer'>
                <div className='resetButton'>
                <CloseIcon onClick={handleResetAllThings}/>
                </div>
                <div className='groupContainerHeading'>
                  <h3>Create Group chat</h3>
                </div>
                <div className='groupNameAndSearch'>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder='group name'/>
                
                  <div className='groupSearchSelected'>
                   {
                      selecteUserForGroup.map((item,i)=> {
                        return (
                          <div className='groupSearchSelectedItem'>
                            <p>{item.username}</p>
                            <CloseIcon onClick={()=>handleRemoveSelecteUser(item)}/>
                          </div>
                        )
                      })
                   } 
                   
                  </div>
                  
                
                  
                
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder='search'/>
                </div>
                <div className='groupSearchResult'>
                  {
                    searchResult.map((item,i)=> (
                      <div className='user-item' key={i} onClick={()=>handleSelecteUserForGroup(item)}>
                        <div className='user-item-profile'>
                          <div className='item-profile-pic'>
                            {/* <img src={`data:${item.pic.contentType};base64,${btoa(String.fromCharCode.apply(null, item.pic.data.data))}`} alt="Profile Pic" /> */}
                            <BinaryImage contentType={item.pic.contentType} data={item.pic.data.data} i={i}/>
                          </div>
                        </div>
                        <div className='user-item-data'>
                          <div className='user-item-identity'>
                            <h3>{item.username}</h3>
                          </div>
                          <div className='lattest-msg'>
                            <p>you: this is your messages</p>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className='createGroupChatButton'>
                  <button onClick={handleCreateGroupChat}>
                    Create Chat
                  </button>
                </div>
            </div>
          </div>
      }
      {
          profileCheck && (
            <div className="checkUserProfile" onClick={()=> setProfileCheck(false)}>
              <div className='checkUserProfileContainer'>
                <div className='checkUserProfilePic'>
                  {/* <img src={backendPath + otherUser.pic} alt="" /> */}
                  {/* <img
                    src={`data:${otherUser.pic.contentType};base64,${otherUser.pic.data}`}
                    alt="Profile Pic"
                  /> */}

                  <BinaryImage contentType={otherUser.pic.contentType} data={otherUser.pic.data.data} />
                </div>
                <div className='checkUserProfileName'>
                  <h2>{otherUser.username}</h2>
                </div>
                <div className='checkUserProfileEmail'>
                  <p>{otherUser.email}</p>
                </div>
              </div>
            </div>
          )
        }

        {
          logedUserProfilecheck && (
            <div className="checkUserProfile" onClick={handleLogedProfile}>
              <div className='checkUserProfileContainer'>
                <div className='checkUserProfilePic'>
                  {/* <img src={backendPath + userData.other.pic} alt="" /> */}
                  {/* <img
                    src={`data:${userData.other.pic.contentType};base64,${userData.other.pic.data}`}
                    alt="Profile Pic"
                  /> */}
                  <BinaryImage contentType={userData.other.pic.contentType} data={userData.other.pic.data.data} />
                </div>
                <div className='checkUserProfileName'>
                  <h2>{userData.other.username}</h2>
                </div>
                <div className='checkUserProfileEmail'>
                  <p>{userData.other.email}</p>
                </div>
              </div>
            </div>
          )
        }         
      <div className='chat-container'>
        
        
        <div className='chat-right'>
          <div className='right-container'>
            <div className='right-container-navbar'>
              <div className='nav-container'>
                <div className='profile'>
                  <div className='nav-profile-pic'>
                    {/* <img src={`${backendPath}${userData.other.pic}`} alt="default" /> */}
                    {/* {console.log("this is for login user",userData.other.pic.contentType, userData.other.pic.data)} */}
                    {/* <img
                      src={`data:${userData.other.pic.contentType};base64,${userData.other.pic.data}`}
                      alt="Profile Pic"
                    /> */}
                    <BinaryImage contentType={userData.other.pic.contentType} data={userData.other.pic.data.data} />
                  </div>
                </div>
                <div className='group-others'>
                  <div className='group-icons'>
                    <GroupsIcon className ="grpicons" onClick={()=> setGroup(true)}/>
                    <MoreVertIcon className='grpicons' onClick={()=> setdropDown(!dropDown)}/>
                    {
                      dropDown && (
                        <div className='dropdown'>
                          <div className='dropBtn' onClick={()=>setLogedUserProfilecheck(true)}>
                            My Profile
                          </div>
                          <div className='dropBtn' onClick={()=>handleLogout(personChat,setPersonChat)}>
                            Log out
                          </div>
                        </div>
                      )
                    }
                    
                  </div>
                </div>
              </div>
            </div>
            <div className='right-search-box'>
                {error && <p className="error-message">{error}</p>}
                <div className='search-container'>
                  <SearchIcon className='search-icon'/>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                  <button className='search-user-button' onClick={handleUsers}>Go</button>
                </div>
            </div>
            <div className='right-container-user-list'>
              <div className='list-container'>
                    {/* {console.log("withoutSaerchRslt",withoutSaerchRslt)} */}
                  {
                    loding ? (
                      <div>Loding</div>
                    ): (
                      <div className='user-list-container'>
                        <div className='user-list-item'>
                          {console.log(withoutSaerchRslt)}
                          {
                            
                            !search ? (
                              
                              withoutSaerchRslt.map((item, i) => {
                                
                               return (
                              
                                <div className='user-item' key={i} onClick={() => accessChat(item)}>
                                <div className='user-item-profile'>
                                  <div className='item-profile-pic'>
                                    {/* <img src={backendPath + item.pic} alt="default" /> */}
                                    {/* <img
                                      src={`data:${item.pic.contentType};base64,${item.pic.data}`}
                                      alt="Profile Pic"
                                    /> */}
                                    {
                                      item.pic && (
                                        <BinaryImage contentType={item.pic.contentType} data={item.pic.data.data} />
                                      )
                                    }
                                    
                                  </div>
                                </div>
                                <div className='user-item-data'>
                                  <div className='user-item-identity'>
                                    <h3>{item.username ? item.username:item.chatName}</h3>
                                    
                                  </div>
                                  <div className='lattest-msg'>
                                    <p>{item.isGroupChat ? `this is groupchat`:`you: this is your messages`}</p>
                                  </div>
                                </div>
                              </div>
                              )}
                              
                              )
                            ):(
                              searchResult.map((item,i)=> (
                                <div className='user-item' key={i} onClick={() => accessChat(item)}>
                                  <div className='user-item-profile'>
                                    <div className='item-profile-pic'>
                                      {/* <img src={`data:${item.pic.contentType};base64,${btoa(String.fromCharCode.apply(null, item.pic.data.data))}`} alt="Profile Pic" /> */}
                                      <BinaryImage contentType={item.pic.contentType} data={item.pic.data.data} i={i}/>
                                    </div>
                                  </div>
                                  <div className='user-item-data'>
                                    <div className='user-item-identity'>
                                      <h3>{item.username}</h3>
                                    </div>
                                    <div className='lattest-msg'>
                                      <p>you: this is your messages</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )

                          }
                        
                          
                        
                        </div>
                      </div>
                      
                    )
                  }
                  
                  
                
              </div>
            </div>
            
          </div>
        </div>


        <div className='chat-container-left'>
          {console.log("check if selected chat is groupChat",selectedChat.isGroupChat)}
          {
            personChat ? (
              selectedChat.isGroupChat
               ?
              <GrpChat socket={socket} userData={userData} selectedChat={selectedChat} user={otherUser} handleProfile={handleProfile}/> 
              :
              <MyChat backendPath ={backendPath} userData={userData} selectedChat={selectedChat} setSelectedChat={setSelectedChat}  socket={socket} user={otherUser} handleProfile={handleProfile} profileCheck={profileCheck}/>
              
            ):(
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
                </div>
              </div>
            )
          }
          
        </div>  
      </div>      
    </div>
  )
}

export default ChatPage
