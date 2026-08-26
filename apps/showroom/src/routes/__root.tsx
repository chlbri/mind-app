/// <reference types="vite/client" />

import { createRootRoute, HeadContent, Scripts } from '@tanstack/solid-router';
import { HydrationScript } from 'solid-js/web';
import HeadLinks from '~ui/organisms/HeadLinks';

import seo from '~/globals/ui/helpers/seo';

import appCss from '../../tailwind.css?url';

/** Root route component defining global layout, HTML shell, and metadata headers. */
export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'Mind Map | by @chlbri',
        description: `A beautiful mind mapping tool to organize your thoughts and ideas.`,
      }),
    ],
  }),

  shellComponent: ({ children }) => {
    return (
      <html lang='en'>
        <head>
          <HydrationScript />
        </head>
        <body class='max-h-screen w-screen font-sans antialiased selection:bg-indigo-500 selection:text-white'>
          <HeadContent />
          <HeadLinks />
          <main class='w-full p-2 text-center'>{children}</main>
          <Scripts />
        </body>
      </html>
    );
  },
});
