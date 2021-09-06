const base = '/docs/';

module.exports = {
  title: '',
  description: ' Documentation',
  repo: '',
  base,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }],
  ],

  themeConfig: {
    logo: '/favicon.png',
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'Links',
        items: [
          {
            text: 'Home',
            link: '/',
          },
          {
            text: 'Github',
            link: 'https://github.com',
          },
        ],
      },
    ],

    sidebar: {
      // catch-all fallback
      '/': [
        {
          text: 'Guide',
          children: [
            {
              text: 'Why Vitepress',
              link: '/guide/why',
            },
            {
              text: 'Getting Started',
              link: '/guide/',
            },
          ],
        },
      ],
    },
  },
};
