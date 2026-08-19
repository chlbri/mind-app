import { Link as _Link } from '@tanstack/solid-router';
import { For, type Component } from 'solid-js';
import {
  createLinks,
  formatLabel1 as formatLabel,
} from '~/globals/ui/signals/links';
import type { PropsOf } from '~/globals/ui/types';

/** Props for individual navigation item {@linkcode Link}. */
type LinkProps = Omit<
  ReturnType<typeof createLinks>[number],
  'children' | 'search'
> &
  Partial<Pick<ReturnType<typeof createLinks>[number], 'search'>> &
  PropsOf<typeof _Link, 'children'>;

/** Individual navigation header router link item component. */
const Link: Component<LinkProps> = ({
  children,
  to,
  search = () => undefined,
}) => {
  return (
    <_Link
      to={to}
      search={search()}
      class={'text-gray-400 hover:scale-105 hover:underline'}
      activeProps={{
        class:
          'text-yellow-900 font-semibold hover:no-underline! hover:scale-100! cursor-default text-xl',
      }}
      activeOptions={{ exact: true }}
    >
      {children}
    </_Link>
  );
};

/**
 * Top navigation header component rendering links across registered router
 * routes.
 */
const HeadLinks: Component = () => {
  const LINKS = createLinks({
    filter: value => value === '/projects' || !value.includes('projects'),
    formatLabel,
  });

  return (
    <header class='flex w-full justify-center gap-2 space-x-2 p-2 text-lg'>
      <For each={LINKS} children={Link} />
    </header>
  );
};

export default HeadLinks;
