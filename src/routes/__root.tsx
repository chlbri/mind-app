/// <reference types="vite/client" />

import seo from '~seo';
import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/solid-router';
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools';
import appCss from '~styles/app.css?url';
import HeadLinks from '~ui/organisms/HeadLinks';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Web animations | by @chlbri',
        description: `A beautifull library of web animations`,
      }),
    ],
  }),

  component: () => {
    return (
      <>
        <HeadContent />
        <HeadLinks />
        <main class='p-2 w-full min-h-full text-center'>
          <Outlet />
        </main>
        <TanStackRouterDevtools position='bottom-left' />
        <Scripts />
      </>
    );
  },
});
