import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'Docslab Examples',
    url: 'http://localhost',
    baseUrl: '/examples/docusaurus/',

    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    routeBasePath: '/',
                },
                blog: false,
                theme: {
                    customCss: ['./src/css/custom.css'],
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'Docslab Examples',
            logo: {
                alt: 'rerobots logo',
                src: 'img/logo.svg',
            },
        },
    } satisfies Preset.ThemeConfig,

    themes: [
        'docslab-docusaurus',
    ],
};

export default config;
