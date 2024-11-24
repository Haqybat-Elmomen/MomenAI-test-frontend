import React, { useState, forwardRef, useImperativeHandle } from "react";
import { API_URL } from "@/config";

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
          {/* Rest of your JSX remains the same */}
        </form>
      </div>
    );
  }
);

export default InputSection;