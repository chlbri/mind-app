/**
 * Example: Using the dimensions prop with NodeComponent
 *
 * This example demonstrates how to use the optional `dimensions` prop
 * to track the x, y, width, and height of a node in real-time.
 */

import { createSignal } from 'solid-js';
import NodeComponent from './NodeComponent';

export const NodeDimensionsExample = () => {
  // Create signals for dimensions
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  // Create signals for position (to demonstrate reactive updates)
  const [posX, setPosX] = createSignal(100);
  const [posY, setPosY] = createSignal(200);

  const handleNodeMount = () => {
    console.log('Node mounted');
  };

  const handleClickOutside = () => {
    console.log('Clicked outside');
  };

  return (
    <div class='p-4 space-y-4'>
      <h2 class='text-2xl font-bold'>Node Dimensions Example</h2>

      {/* Display current dimensions */}
      <div class='bg-gray-100 p-4 rounded-lg'>
        <h3 class='font-semibold mb-2'>Current Dimensions:</h3>
        <div class='grid grid-cols-2 gap-2 text-sm'>
          <div>X: {x().toFixed(2)}px</div>
          <div>Y: {y().toFixed(2)}px</div>
          <div>Width: {width().toFixed(2)}px</div>
          <div>Height: {height().toFixed(2)}px</div>
        </div>
      </div>

      {/* Controls to move the node */}
      <div class='bg-blue-50 p-4 rounded-lg'>
        <h3 class='font-semibold mb-2'>Controls:</h3>
        <div class='space-x-2'>
          <button
            class='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            onClick={() => {
              setPosX(prev => prev + 50);
            }}
          >
            Move Right
          </button>
          <button
            class='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            onClick={() => {
              setPosY(prev => prev + 50);
            }}
          >
            Move Down
          </button>
          <button
            class='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
            onClick={() => {
              setPosX(100);
              setPosY(200);
            }}
          >
            Reset Position
          </button>
        </div>
      </div>

      {/* The node with dimensions tracking */}
      <div class='relative h-96 bg-gray-50 border-2 border-gray-300 rounded-lg'>
        <NodeComponent
          x={posX()}
          y={posY()}
          selected={false}
          label='Example Node'
          content={<div>This node tracks its dimensions!</div>}
          inputs={1}
          outputs={1}
          dimensions={{
            x,
            setX,
            y,
            setY,
            width,
            setWidth,
            height,
            setHeight,
          }}
          onNodeMount={handleNodeMount}
          onClickOutside={handleClickOutside}
        />
      </div>

      {/* Usage instructions */}
      <div class='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
        <h3 class='font-semibold mb-2'>Usage:</h3>
        <pre class='text-xs overflow-x-auto'>
          {`import { createSignal } from 'solid-js';
import NodeComponent from './NodeComponent';

// Create signals for dimensions
const [x, setX] = createSignal(0);
const [y, setY] = createSignal(0);
const [width, setWidth] = createSignal(0);
const [height, setHeight] = createSignal(0);

// Use the dimensions prop
<NodeComponent
  x={100}
  y={200}
  selected={false}
  inputs={1}
  outputs={1}
  dimensions={{
    x,
    setX,
    y,
    setY,
    width,
    setWidth,
    height,
    setHeight,
  }}
  onNodeMount={handleNodeMount}
  onClickOutside={handleClickOutside}
/>

// Access dimensions anywhere in your component
console.log('Node width:', width());
console.log('Node height:', height());`}
        </pre>
      </div>
    </div>
  );
};
