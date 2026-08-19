import { For, type Accessor, type Component } from 'solid-js';

import { Accordion as AccordionD } from '~/globals/ui/cn/components/ui/accordion';

/** Data item model for an accordion Q&A question-and-answer entry. */
export type AccordionData = {
  /** The question string displayed on the trigger header. */
  question: string;
  /** The answer content revealed when expanded. */
  answer: string;
};

/** Internal component rendering an individual accordion item for a Q&A pair. */
const Item: Component<AccordionData & { index: Accessor<number> }> = ({
  question,
  answer,
  index,
}) => {
  return (
    <AccordionD.Item value={`Item - ${index()}`}>
      <AccordionD.Trigger class='cursor-pointer' children={question} />
      <AccordionD.Content class='cursor-pointer' children={answer} />
    </AccordionD.Item>
  );
};

/**
 * Accordion component rendering a collapsible list of Questions and Answers.
 *
 * @param props - Component props containing the Q&A dataset of type
 *   {@linkcode AccordionData}[].
 *
 * @returns Rendered Accordion QA element JSX.
 */
export const AccordionQA: Component<{ data: AccordionData[] }> = ({ data }) => {
  return (
    <AccordionD collapsible class='mx-auto min-w-md'>
      <For
        each={data}
        children={(data, index) => {
          const props = { ...data, index };
          return <Item {...props} />;
        }}
      />
    </AccordionD>
  );
};

export default AccordionQA;
