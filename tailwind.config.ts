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

import { type Config } from 'tailwindcss';
import defaultConfig from 'tailwindcss/defaultConfig';

const defineConfig = (config: Config) => config;

export default defineConfig({
    darkMode: 'class',
    content: ['./**/*.{js,ts,vue,html}'],
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...(defaultConfig.theme!.fontFamily! as any).sans],
                mono: ['"JetBrains Mono"', ...(defaultConfig.theme!.fontFamily! as any).mono],
                serif: ['Cantarell', ...(defaultConfig.theme!.fontFamily! as any).serif]
            }
        }
    }
});
