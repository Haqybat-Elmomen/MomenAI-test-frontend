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

  const isMp3Chunk = (chunk: Uint8Array): boolean => {
    // Check for MP3 frame sync (0xFF 0xFB)
    return chunk.length >= 2 && chunk[0] === 0xFF && chunk[1] === 0xFB;
  };

  const processAudioChunks = async (chunks: Uint8Array) => {
    try {
      if (!audioContext.current) await initializeAudioContext();
      if (!audioContext.current) return;

      // Create a Blob from the chunks
      const blob = new Blob([chunks], { type: 'audio/mpeg' });
      
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      // Add to queue and play if not already playing
      audioQueue.current.push(audioBuffer);
      if (!isPlaying.current) {
        void playNextInQueue();
      }
    } catch (error) {
      console.error('Error processing audio chunks:', error);
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
          text,
          language
        }),
      });

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      let chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process all accumulated chunks
          if (chunks.length > 0) {
            const combinedChunks = new Uint8Array(
              chunks.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            chunks.forEach(chunk => {
              combinedChunks.set(chunk, offset);
              offset += chunk.length;
            });
            await processAudioChunks(combinedChunks);
          }
          break;
        }

        if (value) {
          chunks.push(value);
          // Process chunks when we have accumulated enough data
          if (chunks.length >= 5) {
            const combinedChunks = new Uint8Array(
              chunks.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            chunks.forEach(chunk => {
              combinedChunks.set(chunk, offset);
              offset += chunk.length;
            });
            await processAudioChunks(combinedChunks);
            chunks = [];
          }
        }
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