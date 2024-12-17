import React, { useState, forwardRef, useImperativeHandle } from "react";
import { API_URL } from "@/config";
import { Input } from "rizzui";
import AutoResizingInput from "@/components/AutoSizeInput";
import TextareaAutosize from 'react-textarea-autosize';


const LoadingStopButton = ({ onStop, className = "" }) => {
  return (
    <button
      onClick={onStop}
      className={`relative w-8 h-8 flex items-center justify-center ${className}`}
      aria-label="Stop generation"
    >
      {/* Outer spinning ring */}
      <svg 
        className="absolute w-8 h-8 animate-spin"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="50"
          cy="50"
          r="45"
          stroke="#0B8457"
          strokeWidth="10"
          fill="none"
        />
        <path
          className="opacity-75"
          stroke="#0B8457"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          d="M 50 5 A 45 45 0 0 1 95 50"
        />
      </svg>
      
      {/* Inner stop button */}
      <div className="relative w-3 h-3 bg-[#0B8457] rounded-sm" />
    </button>
  );
};

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

    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const handleStopGeneration = () => {
      if (abortController) {
        abortController.abort();
        setSending(false);
      }
    };

    
    // Extract the submission logic into a separate function
    const submitQuestion = async (text: string) => {
      if (isSending || !sessionId || text.trim() === "") {
        return;
      }

      try {

        const controller = new AbortController();
        setAbortController(controller);

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
          signal: controller.signal // Add this line
        });

        if (!response.ok) {
          throw new Error('Stream response was not ok');
        }

        let accumulatedContent = "";
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        // onFormSubmit({
        //   status: "assistant",
        //   content: "",
        //   isStreaming: true
        // });

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
              } else if (data.type === 'action') {
                onFormSubmit({
                  status: "action",
                  content: data.cat,
                  isStreaming: false,
                });
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
              onFormSubmit({
                status: "error",
                content: "An error occurred while generating the response."
              });
              console.error('Error parsing chunk:', e, 'Raw line:', line);
            }
          }
        }

        setSending(false);
      } catch (error) {
        if (error.name === 'AbortError' || (error instanceof DOMException && error.name === 'AbortError')) {
          onFormSubmit({
            status: "stopped",
          });
        } else {
          onFormSubmit({
            status: "error",
            content: "An error occurred while generating the response."
          });
          console.error('Error:', error);
        }
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
      {isSending ? (   <LoadingStopButton onStop={handleStopGeneration} />) : (<img
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