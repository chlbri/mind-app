import type { Accessor, Component } from 'solid-js';

const Counter: Component<{
  onClick: () => void;
  count: Accessor<number>;
  label: string;
}> = ({ onClick, label, count }) => {
  return (
    <button
      class='cursor-pointer rounded-2xl border-2 border-gray-900 bg-blue-200 px-5 py-3 text-blue-800 outline-none focus:border-blue-600 active:bg-gray-200'
      onClick={onClick}
      type='button'
    >
      {`${label}${count()}`}
    </button>
  );
};

export default Counter;
