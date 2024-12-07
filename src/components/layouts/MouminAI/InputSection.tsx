import React, { useState, forwardRef, useImperativeHandle } from "react";
import { API_URL } from "@/config";
import { Input } from "rizzui";
import AutoResizingInput from "@/components/AutoSizeInput";
import TextareaAutosize from 'react-textarea-autosize';

// Define the interface for the ref methods
export interface InputSectionRef {
  submitQuestion: (text: string) => Promise<void>;
}

interface InputSectionProps {
  onFormSubmit: (data: any) => void;
  conversation_id: string;
  sessionId: string | ((value: string) => void);
}

const InputSection = forwardRef<InputSectionRef, InputSectionProps>(
  ({ onFormSubmit, conversation_id, sessionId }, ref) => {
    const [question, setQuestion] = useState('');
    const [isSending, setSending] = useState(false);

    // Extract the submission logic into a separate function
    const submitQuestion = async (text: string) => {
      if (isSending || !sessionId || text.trim() === "") {
        return;
      }

      try {
        setSending(true);
        onFormSubmit({
          status: "user",
          content: text
        });

        let submitQuery = text;
        setQuestion("");
        const startTime = performance.now();

        const response = await fetch(`${API_URL}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({ 
            query: submitQuery, 
            sessionId: sessionId, 
            conversationId: conversation_id 
          }),
        });

        if (!response.ok) {
          throw new Error('Stream response was not ok');
        }

        let accumulatedContent = "";
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        onFormSubmit({
          status: "assistant",
          content: "",
          isStreaming: true
        });

        while (true) {
          const { done, value } = await reader?.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.error) {
                onFormSubmit({
                  status: "error",
                  content: "An error occurred while generating the response."
                });
                break;
              } else if (data.type === 'end') {
                const endTime = performance.now();
                const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2);
                
                onFormSubmit({
                  status: "assistant",
                  content: accumulatedContent,
                  isStreaming: false,
                  executionTime: timeInSeconds,
                  trace_id: data.trace_id
                });
                
              } else if (data.content) {
                accumulatedContent += data.content;
                onFormSubmit({
                  status: "assistant",
                  content: accumulatedContent,
                  isStreaming: true
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e, 'Raw line:', line);
            }
          }
        }

        setSending(false);
      } catch (error) {
        setSending(false);
        onFormSubmit({
          status: "error",
          content: "An error occurred while generating the response."
        });
        console.error('Error:', error);
      }
    };

    // Expose the submitQuestion method through ref
    useImperativeHandle(ref, () => ({
      submitQuestion
    }));

    const handleSubmit = async (event: any) => {
      event.preventDefault();
      await submitQuestion(question);
    };

    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <form id="form" 
          className="flex w-full overflow-hidden gap-2 items-center py-1 pr-4 bg-white rounded-xl border border-solid border-neutral-900 border-opacity-10 min-h-[56px] shadow-[0px_0px_80px_rgba(0,0,0,0.08)]"
          onSubmit={handleSubmit}
        >
           <input type="submit" id="submit" style={{display: "none"}} />
    <label htmlFor="questionInput" className="sr-only">
      اكتب سؤالك
    </label>
    <TextareaAutosize
             id="questionInput"
             autoComplete="off"
             autoCorrect="off"
             autoCapitalize="off"
             spellCheck="false"
             value={question}
             maxLength={300}
             onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  // Allow new line with Shift+Enter
                  return;
                } else {
                  e.preventDefault();
                  // Add your submit logic here
                  document.getElementById('submit').click()
                }
              }
            }}
             onChange={(e) => setQuestion(e.target.value)}
             className="flex-1 shrink self-stretch my-auto text-base font-normal text-right basis-0 text-neutral-900 text-opacity-40 bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-none border-none text-[16px] placeholder:text-neutral-400" // Added text-[16px]
             style={{
               fontSize: '16px',
               transform: 'scale(1)',
               touchAction: 'manipulation',
               resize: 'none'  // Add this line
             }}
             placeholder="اكتب سؤالك"
           />

    <div className="flex gap-2 justify-center items-center self-stretch my-auto w-12 min-h-[48px]">
      {isSending ? (
<div role="status">
    <svg aria-hidden="true" className="w-8 h-8 animate-spin fill-[#0B8457]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#fff"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
</div>
) : (<img
  loading="lazy"

  src="https://cdn.builder.io/api/v1/image/assets/TEMP/7875f712ebcf40ea4d75685127d45e343865e87ac3cb37c5c9a42d582043c46f?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
  alt=""
  onClick={() => document.getElementById('submit').click()  } // Trigger form submission
  className="object-contain self-stretch my-auto w-5 aspect-square"
/>)}
    
    </div>
        </form>
      </div>
    );
  }
);

export default InputSection;