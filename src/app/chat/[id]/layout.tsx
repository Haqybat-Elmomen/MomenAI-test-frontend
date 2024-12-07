"use client"

import React, { useState, useEffect } from 'react';
import ProfileSection from "../../../components/layouts/MouminAI/ProfileSection";
import ChatMessage from '@/components/chat/ChatMessage';
import useLocalStorage from '@/components/layouts/MouminAI/sessionId';
import ChatHistory from '@/components/layouts/MouminAI/ChatHistory';
import { useParams } from 'next/navigation'
import { API_URL } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import { Drawer } from 'rizzui';

const Conversation: React.FC = () => {

  const router = useParams();
  const [messages, setMessages] = useState<string[{}]>([])
  const [sessionId, setSessionId] = useLocalStorage('sessionId', "")
  const [conversations, setConversations] = useState([])
  const [drawerState, setDrawerState] = useState(false);

  let uuid = uuidv4();

    // Handle sessionId initialization
    useEffect(() => {
      if (!sessionId) {
        setSessionId(uuidv4());
      }
  }, []); // Empty dependency array so it only runs once
  

  useEffect(() => {
    
    if (!sessionId) return; // Skip if sessionId is not yet set

    function filterMessages(conversationId : any, data : any) {
        for (const conversation of data) {
            if (conversation.conversation_id === conversationId) {
                return conversation.messages;
            }
        }
        return [];
    }

    const getData = async () => {

      try {
             
        const response = await fetch(`${API_URL}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            "sessionId": sessionId ?? uuid,
           }),
        });
  
  
        if (!response.ok) {
          throw new Error('Something went wrong');
        }
  
        const data = await response.json();
        let json = JSON.parse(data)

        setMessages(filterMessages(router.id, json))
        setConversations(json)

        // Handle response data here
      } catch (error) {
       
        console.error('Error:', error);
        // Handle error here
      }

      
    }

    getData()
    
  }, [sessionId])

  if (messages.length == 0) {
    return (  <div className="flex h-screen w-full items-center justify-center bg-neutral-100">
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-12 h-12 animate-spin text-emerald-700 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <div className="text-lg font-medium text-neutral-900">جاري التحقق من جاهزية النظام...</div>
      </div>
    </div>)
  } else {
  return (
    <div className='relative flex h-full w-full bg-neutral-100 overflow-hidden transition-colors z-0'>
      
      <Drawer
        isOpen={drawerState}
        onClose={() => setDrawerState(false)}
        customSize={360}
      >
        <div className="z-[1] bg-neutral-100 flex-shrink-0 overflow-x-hidden bg-neutral-100 fixed top-0 right-0 h-full" style={{ "width": "384px" }}>
          <ChatHistory onCloseBtnClicked={() => setDrawerState(false)} conversations={conversations} />
        </div>
      </Drawer>
     
      <div className='relative flex h-full max-w-full flex-1 flex-col overflow-hidden'>
        
        <div className='draggable sticky top-0 z-10 flex min-h-[56px] items-center justify-center border-transparent bg-token-main-surface-primary pl-0 '>
          <ProfileSection onDrawerIconClicked={() => setDrawerState(true)} />
        </div> 
     
    <main className='relative h-full w-full flex-1 overflow-auto transition-width'>
    <div className='composer-parent flex h-full flex-col focus-visible:outline-0'>
      <div className='relative flex max-w-full flex-1 flex-col overflow-hidden'>

          {messages.length == 0 ? (
            <>
              
            </>
          ) : (
              <div className="flex-1 overflow-x-hidden font-medium self-center text-neutral-900 text-opacity-90">
                <div className='h-full'>
                  {messages.map((message, index) => (
                    <div  key={index}  className='w-full text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]'>
                      <div className='m-auto text-lg	 py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5'>
                        <ChatMessage
                          sender={message.role}
                          content={message.content}
                          index={index}
                          item={message}
                        />
                      </div>
                    </div>
                  ))}
                  </div>
              </div>
          )}

</div>


</div>

</main>

</div>

</div>

  );

}
};

export default Conversation;
