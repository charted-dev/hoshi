/*
 * 🐻‍❄️🎨 Hoshi: Official web interface to interact with charted-server, made with Vite and Vue
 * Copyright 2023 Noelware, LLC. <team@noelware.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'url';

const asFilePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineNuxtConfig({
    telemetry: false,
    modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxtjs/robots', '@vueuse/nuxt', '@pinia/nuxt'],
    srcDir: asFilePath('./src'),
    css: ['~/assets/styles/main.css'],
    app: {
        head: {
            htmlAttrs: {
                lang: 'en'
            },
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { charset: 'utf-8' },
                { name: 'theme-color', content: '#58548E' },
                { name: 'language', content: 'English (US)' },
                { name: 'keywords', content: 'noelware, charted, charted-server' }
            ],
            link: [
                {
                    rel: 'shortcut icon',

                    // TODO(@auguwu): switch to charted branding
                    href: 'https://cdn.floofy.dev/images/trans.png'
                }
            ]
        }
    },
    alias: {
        '~/': '/<rootDir>'
    },
    dir: {
        pages: 'views'
    },
    postcss: {
        plugins: {
            autoprefixer: {}
        }
    },
    typescript: {
        typeCheck: false,
        tsConfig: asFilePath('./tsconfig.json'),
        shim: false
    },
    tailwindcss: {
        cssPath: '~/assets/styles/main.css',
        viewer: process.env.NODE_ENV === 'development'
    },
    colorMode: {
        classSuffix: '',
        preference: 'system'
    },
    experimental: {
        payloadExtraction: false
    },
    nitro: {
        preset: 'node'
    }
});
