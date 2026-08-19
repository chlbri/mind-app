import { cn } from '~/globals/ui/cn/utils';
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionTriggerProps,
} from '@kobalte/core/accordion';
import { Accordion as AccordionPrimitive } from '@kobalte/core/accordion';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import {
  type ParentProps,
  type ValidComponent,
  splitProps,
} from 'solid-js';

/**
 * Root Accordion component providing collapsible panels.
 *
 * @template | {@linkcode ValidComponent} `T` - Underlying DOM element tag
 *   or component. Defaults to `'div'`.
 *
 * @param props - Accordion primitive properties.
 *
 * @returns The rendered root accordion JSX element.
 */
export function Accordion<T extends ValidComponent = 'div'>(
  props: Parameters<typeof AccordionPrimitive<T>>[0],
) {
  return <AccordionPrimitive {...props} />;
}

// #region Item
/** Props for the {@linkcode AccordionItem} component. */
type accordionItemProps<T extends ValidComponent = 'div'> =
  AccordionItemProps<T> & { class?: string };

/**
 * Individual collapsible item within an Accordion container.
 *
 * @template | {@linkcode ValidComponent} `T` - Underlying DOM element tag
 *   or component. Defaults to `'div'`.
 *
 * @param props - Polymorphic accordion item props of type
 *   {@linkcode accordionItemProps}.
 *
 * @returns The rendered accordion item JSX element.
 */
const AccordionItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, accordionItemProps<T>>,
) => {
  const [local, rest] = splitProps(props as accordionItemProps, ['class']);

  return (
    <AccordionPrimitive.Item
      class={cn('border-b', local.class)}
      {...rest}
    />
  );
};
// #endregion

// #region Trigger
/** Props for the {@linkcode AccordionTrigger} component. */
type accordionTriggerProps<T extends ValidComponent = 'button'> =
  ParentProps<AccordionTriggerProps<T> & { class?: string }>;

/**
 * Interactive header button toggling the expanded state of an
 * AccordionItem.
 *
 * @template | {@linkcode ValidComponent} `T` - Underlying DOM element tag
 *   or component. Defaults to `'button'`.
 *
 * @param props - Polymorphic trigger props of type
 *   {@linkcode accordionTriggerProps}.
 *
 * @returns The rendered accordion trigger header JSX element.
 */
const AccordionTrigger = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, accordionTriggerProps<T>>,
) => {
  const [local, rest] = splitProps(props as accordionTriggerProps, [
    'class',
    'children',
  ]);

  return (
    <AccordionPrimitive.Header class='flex' as='div'>
      <AccordionPrimitive.Trigger
        class={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-shadow hover:underline focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring [&[data-expanded]>svg]:rotate-180',
          local.class,
        )}
        {...rest}
      >
        {local.children}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          class='text-muted-foreground h-4 w-4 transition-transform duration-200'
        >
          <path
            fill='none'
            stroke='currentColor'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='m6 9l6 6l6-6'
          />
          <title>Arrow</title>
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};
// #endregion

// #region Content
/** Props for the {@linkcode AccordionContent} component. */
type accordionContentProps<T extends ValidComponent = 'div'> = ParentProps<
  AccordionContentProps<T> & { class?: string }
>;

/**
 * Collapsible content section revealed when the corresponding trigger is
 * active.
 *
 * @template | {@linkcode ValidComponent} `T` - Underlying DOM element tag
 *   or component. Defaults to `'div'`.
 *
 * @param props - Polymorphic content props of type
 *   {@linkcode accordionContentProps}.
 *
 * @returns The rendered accordion content panel JSX element.
 */
const AccordionContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, accordionContentProps<T>>,
) => {
  const [local, rest] = splitProps(props as accordionContentProps, [
    'class',
    'children',
  ]);

  return (
    <AccordionPrimitive.Content
      class={cn(
        'animate-accordion-up overflow-hidden text-sm data-expanded:animate-accordion-down',
        local.class,
      )}
      {...rest}
    >
      <div class='pt-0 pb-4'>{local.children}</div>
    </AccordionPrimitive.Content>
  );
};
// #endregion

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
