"use client"

import React, { useState, useEffect } from 'react';
import ProfileSection from "../../../components/layouts/MouminAI/ProfileSection";
import ChatMessage from '@/components/chat/ChatMessage';
import useLocalStorage from '@/components/layouts/MouminAI/sessionId';
import ChatHistory from '@/components/layouts/MouminAI/ChatHistory';
import { useParams } from 'next/navigation'
import { API_URL } from '@/config';
import { v4 as uuidv4 } from 'uuid';

const Conversation: React.FC = () => {

  const router = useParams();
  const [messages, setMessages] = useState<string[{}]>([])
  const [sessionId, setSessionId] = useLocalStorage('sessionId', "")
  const [conversations, setConversations] = useState([])

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

  return (
    <div className='relative flex h-full w-full bg-neutral-100 overflow-hidden transition-colors z-0'>
      
      <div className="z-[1] bg-neutral-100 flex-shrink-0 overflow-x-hidden bg-neutral-100 border-l max-md:!w-0 hidden md:block fixed top-0 right-0 h-full pt-[56px]" style={{ "width": "260px" }}>
        <ChatHistory conversations={conversations} />
      </div>

      <div className='relative flex h-full max-w-full flex-1 flex-col overflow-hidden'>
        
        <div className='draggable sticky top-0 z-10 flex min-h-[56px] items-center justify-center border-transparent bg-token-main-surface-primary pl-0 '>
          <ProfileSection />
        </div> 
     
    <main className='relative h-full w-full flex-1 overflow-auto transition-width'>
    <div className='composer-parent flex h-full flex-col focus-visible:outline-0'>
      <div className='relative flex max-w-full flex-1 flex-col overflow-hidden'>

          {messages.length == 0 ? (
            <>
              no messages
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
};

export default Conversation;
