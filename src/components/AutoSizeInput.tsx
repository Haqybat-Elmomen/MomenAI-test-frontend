import React, { useRef, useEffect } from 'react';
import { Input } from 'rizzui';

const AutoResizingInput = ({ value, onChange, ...props }) => {
  const textAreaRef = useRef(null);

  const adjustHeight = () => {
    const element = textAreaRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <Input
      {...props}
      ref={textAreaRef}
      type='text'
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      className={`${props.className} resize-none min-h-[40px] max-h-[200px] overflow-y-auto`}
    />
  );
};

export default AutoResizingInput;