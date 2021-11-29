const base = '/'

module.exports = {
  title: 'Solomon Documentation',
  description: 'Solomon Plugin and Smart Contract Documentation',
  repo: 'solomondefi/solomon-monorepo',
  base,
  head: [['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }]],

  themeConfig: {
    logo: '/header_logo.png',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Plugin', link: '/plugin/' },
      { text: 'Contracts', link: '/contracts/' },
      { text: 'Services', link: '/services/' },
      {
        text: 'Links',
        items: [
          {
            text: 'Solomon Home',
            link: 'https://solomondefi.com/',
          },
          {
            text: 'Github',
            link: 'https://github.com/solomondefi',
          },
          {
            text: 'Telegram',
            link: 'https://t.me/solomondefiproject',
          },
          {
            text: 'Twitter',
            link: 'https://twitter.com/solomondefi',
          },
          {
            text: 'Facebook',
            link: 'https://facebook.com/solomondefi',
          },
          {
            text: 'Medium (Blog)',
            link: 'https://medium.com/@solomondefi',
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
              text: 'Why Solomon',
              link: '/guide/',
            },
            {
              text: 'Technology',
              link: '/guide/technology',
            },
          ],
        },
        {
          text: 'Contributing',
          link: '/contributing/',
          children: [
            {
              text: 'General',
              link: '/contributing/general',
            },
            {
              text: 'Commit Format',
              link: '/contributing/commit-format',
            },
            {
              text: 'Architecture',
              link: '/contributing/architecture',
            },
            {
              text: 'Code of Conduct',
              link: '/contributing/code-of-conduct',
            },
          ],
        },
        {
          text: 'Plugin',
          children: [
            {
              text: 'Usage',
              link: '/plugin/',
            },
            {
              text: 'Plugin API',
              link: '/plugin/api',
            },
            {
              text: 'Shopping Cart',
              link: '/plugin/shopping',
            },
            {
              text: 'Theming',
              link: '/plugin/theming',
            },
          ],
        },
        {
          text: 'Smart Contracts',
          children: [
            {
              text: 'Usage',
              link: '/contracts/',
            },
            {
              text: 'Customization',
              link: '/contracts/customization',
            },
            {
              text: 'API',
              link: '/contracts/api',
            },
          ],
        },
        {
          text: 'Services',
          link: '/services/',
          children: [
            {
              text: 'Blockchain Watcher',
              link: '/services/watcher',
            },
            {
              text: 'Dispute API',
              link: '/services/dispute',
            },
            {
              text: 'Evidence Upload',
              link: '/services/evidence',
            },
            {
              text: 'Link Shortener',
              link: '/services/shortener',
            },
          ],
        },
      ],
    },
  },
}
