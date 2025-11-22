/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/solid-router';

import seo from '~seo';
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
        title: 'Mind Map | by @chlbri',
        description: `A beautiful mind mapping tool to organize your thoughts and ideas.`,
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
        <Scripts />
      </>
    );
  },
});
