/**
 * This code was generated by Builder.io.
 */
import React from "react";

interface QuestionProps {
  text: string;
  iconSrc: string;
  bgColor: string;
  onQuestionClick: (text: string) => void;
}

const Question: React.FC<QuestionProps> = ({ text, iconSrc, bgColor, onQuestionClick }) => (
  <div 
  className="flex gap-2 mt-1 items-center cursor-pointer hover:bg-gray-100 p-2.5 w-full rounded-xl border border-dashed border-neutral-900 border-opacity-10 min-h-[56px] min-w-[144px]"
  onClick={() => onQuestionClick(text)}
  >
    <div
      className={`flex gap-2 justify-center items-center self-stretch px-2 my-auto w-9 h-9 rounded-lg ${bgColor} min-h-[36px]`}
    >
      <img
        loading="lazy"
        src={iconSrc}
        alt=""
        className="object-contain self-stretch my-auto w-5 aspect-square"
      />
    </div>
    <div className="flex-1 shrink self-stretch my-auto text-sm font-medium leading-none text-right basis-4 text-neutral-900 text-opacity-90">
      {text}
    </div>
  </div>
);

interface SuggestedQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onQuestionSelect }) => {
  const questions = [
    {
      text: "ما هي أصول الدين؟",
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/ea4d0aa1c81b39b747eaff5e8713c56ca9ffaadcb4fc14866cd9bda53c024eac?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3",
      bgColor: "bg-emerald-700 bg-opacity-10",
    },
    {
      text: "ما هو تفسير سورة البقرة بشكل مختصر؟",
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/1e21215d305e223acb373435511126d8c0c914ed4f5db2b5ea0ef67d0d05b6ed?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3",
      bgColor: "bg-indigo-700 bg-opacity-10",
    },
    {
      text: "ما هي الصلوات الواجبة والمستحبة؟",
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/d8f74a588aff4c670b1bd91d761c3f96b9fe6f72c9fb305fd631c6654ffe96e3?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3",
      bgColor: "bg-lime-400 bg-opacity-10",
    },
    {
      text: "ما حكم الصيام في السفر؟",
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/512a6dc544fcd7d837ab33a4c6fc5547c167ecf0a8ddbcfe968324989f830b74?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3",
      bgColor: "bg-pink-700 bg-opacity-10",
    },
  ];

  return (
    <section className="flex flex-col self-center pt-12 pb-2 mt-4 mb-4 w-full max-w-[328px] min-h-[552px]">
      <div className="flex flex-col justify-center self-center max-w-full font-medium w-[200px]">
        <div className="flex gap-1 justify-center items-center self-center text-xs text-right text-neutral-900 text-opacity-60">
          <div className="self-stretch my-auto">مرحبا بك في</div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e5e44f611018c04c4a9dfaa7bedf6f80c8c6c1d7636e61a3de1964eb071f9534?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
          />
        </div>
        <div className="flex flex-col justify-center items-center mt-4 w-full">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2443496667fb325034febb1f2638d43214733861c4bd69cfd624ca9b4e9a8f74?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            alt="مؤمن AI"
            className="object-contain w-16 aspect-square rounded-[1000px]"
          />
          <div className="mt-2 text-base text-right text-neutral-900 text-opacity-90">
            مؤمن AI
          </div>
          <p className="self-stretch mt-2 text-xs leading-5 text-center text-neutral-900 text-opacity-60">
            مساعدك الإسلامي الشخصي للإجابة عن مختلف أسئلتك الدينية والعقائدية.
          </p>
        </div>
      </div>
      <div className="flex flex-col mt-10 w-full">
        <div className="flex gap-2 justify-center items-center w-full text-sm font-medium leading-none text-center text-neutral-900 text-opacity-60">
          <div className="self-stretch my-auto">أسئلة مقترحة</div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/17bd0af8ad04c22680d4850755603794e8e105a8e7ce6e25dec27a7c593bd2f0?placeholderIfAbsent=true&apiKey=645ca4b112e14229a2cd3203c4a5d6b3"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
          />
        </div>
        <div className="flex flex-col mt-3 w-full">
          {questions.map((q, index) => (
            <Question
              key={index}
              text={q.text}
              iconSrc={q.iconSrc}
              bgColor={q.bgColor}
              onQuestionClick={onQuestionSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestedQuestions;
