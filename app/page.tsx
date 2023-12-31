'use client';

import { useState, useRef } from 'react';
import { FaUndo, FaTrash } from 'react-icons/fa';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

export default function Home() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>('');
  const [outputImage, setOutputImage] = useState<string | null>('');

  function undo() {
    canvasRef?.current?.undo();
  }

  function clear() {
    canvasRef?.current?.clearCanvas();
  }

  async function generateOutputImage() {
    // User needs to provide the prompt
    if (!prompt) {
      setError('You need to provide a prompt.');
      return;
    }

    // Convert sketch to Base64 string
    const base64 = await canvasRef.current?.exportImage('png');
    console.info('Base64 string derived from the sketch', base64);

    // Call API to generate AI image
    if (base64) {
      await generateAIImage(base64);
    }
  }

  async function generateAIImage(base64Image: string) {
    const response = await fetch('/api/replicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, prompt }),
    });

    const result = await response.json();
    console.log('AI image', result);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOutputImage(result.output[1]);
  }

  return (
    <main className='max-w-3xl mx-auto my-10 px-4'>
      {/* Header */}
      <header className='flex items-center justify-center mb-10'>
        <h1 className='font-semibold text-transparent text-5xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block bg-clip-text'>
          Scribble For Fun
        </h1>
      </header>

      {/* Sketch canvas */}
      <section className='w-[400px] h-[400px] mx-auto mb-12 mt-6'>
        <div className='w-full aspect-square border-none'>
          <ReactSketchCanvas
            ref={canvasRef}
            width='100%'
            height='100%'
            strokeWidth={4}
            strokeColor='#000'
          />
        </div>

        <div className='flex items-center justify-between mt-2'>
          <button
            onClick={undo}
            className='text-gray-300 text-md flex items-center hover:scale-110 duration-300 hover:text-yellow-500'
          >
            <FaUndo className='mr-2' /> Undo
          </button>

          <button
            onClick={clear}
            className='text-gray-300 text-md flex items-center hover:scale-110 duration-300 hover:text-yellow-500'
          >
            <FaTrash className='mr-2' /> Clear
          </button>
        </div>
      </section>

      {/* Prompt */}
      <section className='w-[400px] flex items-center mx-auto'>
        <input
          type='text'
          name='prompt'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Enter your prompt here'
          className='rounded-l-lg py-3 px-4 w-full focus:outline-none text-black'
        />

        <button
          onClick={generateOutputImage}
          className='rounded-r-lg py-3.5 px-4 ml-1 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium text-sm text-center'
        >
          Generate
        </button>
      </section>

      {/* Output image */}
      <section className='w-[400px] h-[400px] flex items-center justify-center mx-auto mt-12'>
        {error ? (
          <div className='flex justify-center'>
            <p className='text-lg text-red-500'>{error}</p>
          </div>
        ) : null}

        {outputImage ? (
          <img
            src={outputImage}
            alt='AI output image'
            className='object-cover w-full aspect-square rounded-lg mb-12'
          />
        ) : null}
      </section>
    </main>
  );
}
