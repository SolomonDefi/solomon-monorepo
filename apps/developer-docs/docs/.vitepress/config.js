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
      { text: 'Utilities', link: '/utilities/' },
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
              link: '/guide/why-solomon',
            },
            {
              text: 'Getting Started',
              link: '/guide/',
            },
            {
              text: 'Technology',
              link: '/guide/technology',
            },
            {
              text: 'Contributing',
              link: '/guide/contributing',
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
          text: 'Utilities',
          children: [
            {
              text: 'Evidence Upload',
              link: '/utilities/',
            },
            {
              text: 'Link Shortener',
              link: '/utilities/shortener',
            },
            {
              text: 'Blockchain Emailer',
              link: '/utilities/mailer',
            },
          ],
        },
      ],
    },
  },
}
