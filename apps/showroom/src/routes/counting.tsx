import { createCounter } from '~/globals/ui/signals/counter';
import { createFileRoute } from '@tanstack/solid-router';
import Counter from '~/globals/ui/molecules/Counter';
import { reduceComponent } from '~/globals/ui/molecules/reducer';

export const Route = createFileRoute('/counting')({
  // Test data from loader
  loader: () => 15,
  component: () => {
    const data = Route.useLoaderData();

    const { count, increment, decrement, incrementFn, decrementFn } =
      createCounter(data());

    const Btn = reduceComponent(Counter, { count });

    const incrementByFive = incrementFn(5);
    const decrementBySeven = decrementFn(7);

    return (
      <div class='mt-5 flex flex-col space-y-10'>
        <h1 class='text-3xl text-blue-500'>Hello Counters !</h1>
        <div class='space-x-5'>
          <Btn label='Increment : ' onClick={increment} />
          <Btn label='Increment (+5) : ' onClick={incrementByFive} />
          <Btn label='Decrement : ' onClick={decrement} />
          <Btn label='Decrement by (-7) : ' onClick={decrementBySeven} />
        </div>
      </div>
    );
  },
});
