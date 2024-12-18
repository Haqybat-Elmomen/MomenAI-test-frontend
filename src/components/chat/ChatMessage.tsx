import React from "react";
import Markdown from 'react-markdown'
import { SyncLoader } from "react-spinners";
import remarkGfm from 'remark-gfm'
import { Loader } from "rizzui";


interface ChatMessageProps {
  sender: "user" | "assistant" | "sending" | "action" | "error" | "stopped";
  content: string;
  item: any;
  index: Number;
  addFeedback?: (itemIndex: Number, score: Number) => void;
}

const MomenActionToString = (action : string) => {
  if (action == "retrieve_sources") {
    return "جاري البحث في المصادر"
  } else if (action == "thinking") {
    return "يتم تكوين الإجابة"
  } else if (action == "analyze") {
    return "يتم تحليل السؤال"
  }
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content, item, index, addFeedback }) => {
  if (sender === "user") {
    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex flex-col justify-center items-start w-full text-base leading-none text-right">
          <div className="p-4 max-w-full rounded-2xl bg-emerald-700 bg-opacity-10 w-[340px]">
            {content}
          </div>
        </div>
      </div>
    );
  } else if (sender == "action") {

    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex gap-2 items-start w-full">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2650ef86336976136e90179de337cbbec42633da15c2064811386351f0291a9?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            className="object-contain shrink-0 w-8 aspect-square rounded-[1000px]"
            alt="AI Avatar"
          />
          <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[340px]">
            <div className="gap-2 self-start text-lg text-right min-h-[32px]">
              مؤمن يفكر..
            </div>
            <div role="status" className="max-w-sm mt-5">
              <div className="flex items-center justify-start gap-1 text-sm loading-shimmer">{MomenActionToString(content)}</div>
            </div>
          </div>
        </div>
      </div>
    );

  }else if (sender == "stopped") {

      return (
        <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
          <div className="flex gap-2 items-start w-full">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2650ef86336976136e90179de337cbbec42633da15c2064811386351f0291a9?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
              className="object-contain shrink-0 w-8 aspect-square rounded-[1000px]"
              alt="AI Avatar"
            />
            <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[340px]">
              <div className="gap-2 self-start text-lg text-right min-h-[32px]">
                مؤمن يفكر..
              </div>
              <div role="status" className="max-w-sm mt-5">
                <div className="flex items-center justify-start gap-1 text-sm">تم إلغاء السؤال</div>
              </div>
            </div>
          </div>
        </div>
      );

      
  } else if (sender == "error") {

    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex gap-2 items-start w-full">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2650ef86336976136e90179de337cbbec42633da15c2064811386351f0291a9?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            className="object-contain shrink-0 w-8 aspect-square rounded-[1000px]"
            alt="AI Avatar"
          />
          <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[340px]">
            <div className="gap-2 self-start text-lg text-right min-h-[32px]">
              مؤمن
            </div>
            <div role="status" className="max-w-sm mt-5">
            حدث خطأ أثناء توليد الإجابة, حاول من جديد
            </div>
          </div>
        </div>
      </div>
    );

  } else if (sender === "assistant") {
    return (
      <div className="mx-auto flex flex-1 text-base gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex gap-2 items-start w-full">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2650ef86336976136e90179de337cbbec42633da15c2064811386351f0291a9?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            className="object-contain shrink-0 w-8 aspect-square rounded-[1000px]"
            alt="AI Avatar"
          />
          <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[340px]">
            <div className="gap-2 self-start text-base text-right min-h-[32px]">
              مؤمن
            </div>
            <div className="text-lg leading-loose font-normal text-right line">
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
              {item.isStreaming && (
                <span className="inline-block ml-1 animate-pulse text-neutral-500">▊</span>
              )}
            </div>
            {!item.isStreaming && item.trace_id && addFeedback && (
              <aside className="flex items-center mt-5">
                <a 
                  onClick={() => addFeedback(index, 1)} 
                  className={`cursor-pointer inline-flex items-center text-sm ${item.feedback == 1 ? 'text-[#0B8457]' : 'text-black text-opacity-50'} font-medium hover:underline`}
                >
                  <svg className="w-3.5 h-3.5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                    <path d="M3 7H1a1 1 0 0 0-1 1v8a2 2 0 0 0 4 0V8a1 1 0 0 0-1-1Zm12.954 0H12l1.558-4.5a1.778 1.778 0 0 0-3.331-1.06A24.859 24.859 0 0 1 6 6.8v9.586h.114C8.223 16.969 11.015 18 13.6 18c1.4 0 1.592-.526 1.88-1.317l2.354-7A2 2 0 0 0 15.954 7Z"/>
                  </svg>
                  إجابة جيدة
                </a>
                <a 
                  onClick={() => addFeedback(index, 0)} 
                  className={`cursor-pointer inline-flex items-center text-sm font-medium hover:underline ${item.feedback == 0 ? 'text-[#FF4C4C]' : 'text-black text-opacity-50'} group ms-5`}
                >
                  <svg className="w-3.5 h-3.5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                    <path d="M11.955 2.117h-.114C9.732 1.535 6.941.5 4.356.5c-1.4 0-1.592.526-1.879 1.316l-2.355 7A2 2 0 0 0 2 11.5h3.956L4.4 16a1.779 1.779 0 0 0 3.332 1.061 24.8 24.8 0 0 1 4.226-5.36l-.003-9.584ZM15 11h2a1 1 0 0 0 1-1V2a2 2 0 1 0-4 0v8a1 1 0 0 0 1 1Z"/>
                  </svg>
                  إجابة سيئة
                </a>
                {/* <span className="inline-flex items-center text-sm font-medium text-black text-opacity-50 ms-5">
                  <svg fill="currentColor" className="w-3.5 h-3.5 me-2.5" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <g>
                      <path d="M256,0C114.842,0,0,114.842,0,256s114.842,256,256,256s256-114.842,256-256S397.158,0,256,0z M374.821,283.546H256 c-15.148,0-27.429-12.283-27.429-27.429V137.295c0-15.148,12.281-27.429,27.429-27.429s27.429,12.281,27.429,27.429v91.394h91.392 c15.148,0,27.429,12.279,27.429,27.429C402.249,271.263,389.968,283.546,374.821,283.546z"></path>
                    </g>
                  </svg>
                  {item.executionTime}
                </span> */}
              </aside>
            )}
          </div>
        </div>
      </div>
    );
  } else { // sending state
    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex gap-2 items-start w-full">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c2650ef86336976136e90179de337cbbec42633da15c2064811386351f0291a9?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            className="object-contain shrink-0 w-8 aspect-square rounded-[1000px]"
            alt="AI Avatar"
          />
          <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[340px]">
            <div className="gap-2 self-start text-lg text-right min-h-[32px]">
              مؤمن يفكر..
            </div>
            <div role="status" className="max-w-sm mt-5">
            <SyncLoader color="#0B8457" />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ChatMessage;