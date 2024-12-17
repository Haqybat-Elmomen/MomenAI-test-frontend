"use client"

import { useState, useRef, useEffect } from 'react';
import { API_URL } from '@/config';

const AudioStreaming = () => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState('ar');
  const audioContext = useRef<AudioContext | null>(null);
  const audioQueue = useRef<AudioBuffer[]>([]);
  const isPlaying = useRef(false);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const currentChunk = useRef<Uint8Array>(new Uint8Array());

  const initializeAudioContext = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }
  };

  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0 || isPlaying.current || !audioContext.current) {
      return;
    }

    isPlaying.current = true;
    const audioBuffer = audioQueue.current.shift()!;
    
    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = audioBuffer;
    sourceNode.current.connect(audioContext.current.destination);
    
    sourceNode.current.onended = () => {
      isPlaying.current = false;
      sourceNode.current = null;
      void playNextInQueue();
    };
    
    try {
      sourceNode.current.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      isPlaying.current = false;
      sourceNode.current = null;
      void playNextInQueue();
    }
  };

  const isWavHeader = (data: Uint8Array): boolean => {
    if (data.length < 12) return false;
    const header = new TextDecoder().decode(data.slice(0, 4));
    return header === 'RIFF';
  };

  const findNextWavStart = (data: Uint8Array): number => {
    for (let i = 0; i < data.length - 4; i++) {
      if (new TextDecoder().decode(data.slice(i, i + 4)) === 'RIFF') {
        return i;
      }
    }
    return -1;
  };

  const processChunk = async (chunk: Uint8Array) => {
    try {
      // Combine with any leftover data from previous chunk
      currentChunk.current = new Uint8Array([...currentChunk.current, ...chunk]);
      
      while (currentChunk.current.length > 0) {
        // Look for WAV header
        const wavStart = findNextWavStart(currentChunk.current);
        if (wavStart === -1) {
          // No complete WAV file found, keep data for next chunk
          break;
        }

        // Remove any data before WAV header
        if (wavStart > 0) {
          currentChunk.current = currentChunk.current.slice(wavStart);
        }

        // Check if we have enough data for header
        if (currentChunk.current.length < 44) break; // 44 bytes is minimum WAV header size

        // Read WAV file size from header
        const fileSize = new DataView(currentChunk.current.buffer, currentChunk.current.byteOffset + 4, 4).getInt32(0, true) + 8;

        // Check if we have the complete WAV file
        if (currentChunk.current.length < fileSize) break;

        // Extract the complete WAV file
        const wavFile = currentChunk.current.slice(0, fileSize);
        currentChunk.current = currentChunk.current.slice(fileSize);

        // Process the WAV file
        if (!audioContext.current) await initializeAudioContext();
        if (!audioContext.current) continue;

        console.log('Processing WAV file of size:', wavFile.length);
        const audioBuffer = await audioContext.current.decodeAudioData(wavFile.buffer);
        audioQueue.current.push(audioBuffer);

        if (!isPlaying.current) {
          void playNextInQueue();
        }
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
    }
  };

  const streamAudio = async () => {
    try {
      await initializeAudioContext();
      
      setIsStreaming(true);
      audioQueue.current = [];
      isPlaying.current = false;
      currentChunk.current = new Uint8Array();

      if (sourceNode.current) {
        sourceNode.current.stop();
        sourceNode.current = null;
      }

      const response = await fetch(`${API_URL}/stream-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: `You are an AI assistant tasked with generating responses specifically optimized for Text-to-Speech (TTS) applications. Follow these guidelines when generating answers:

            Numerals: Write out all numbers as full words (e.g., write "15" as "خمسة عشر").
            Mathematical Symbols: Replace symbols like *, +, or / with their verbal equivalents in Arabic, such as "ضرب" (for multiplication), "زائد" (for addition), and "قسمة" (for division).
            Punctuation: Use proper punctuation to ensure the TTS generates natural pauses (e.g., periods, commas, or question marks).
            Clarity: Simplify and clarify complex sentences to sound natural and fluid when spoken aloud.
            Arabic Language: Always provide the answer in Modern Standard Arabic (فصحى) unless specified otherwise.
            Numbers in Sequences: When responding with lists or sequences, provide them in words and ordered logically.
            Example:
            Input: "كم ناتج ١٥ * ٢٩؟"
            Output: "ناتج خمسة عشر ضرب تسعة وعشرين هو أربعمائة وخمسة وثلاثون."
            \n Question: ${text}`,
          language
        }),
      });

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        console.log(done, value)
        if (done) break;
        if (value) await processChunk(value);
      }

    } catch (error) {
      console.error('Error streaming audio:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Language:</label>
        <select
          className="w-full p-2 border rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="ar">Arabic</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text:</label>
        <textarea
          className="w-full p-2 border rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          rows={4}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>
      
      <button
        className="w-full py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
        onClick={streamAudio}
        disabled={isStreaming || !text}
      >
        {isStreaming ? 'Generating Audio...' : 'Generate Audio'}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        {isStreaming && <div>Processing audio stream...</div>}
      </div>
    </div>
  );
};

export default AudioStreaming;