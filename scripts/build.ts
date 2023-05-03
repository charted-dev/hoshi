/*
 * 🐻‍❄️🎨 hoshi: Official web interface to interact with charted-server, made with Vite and Vue
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

import { mkdir, readFile, rm } from 'fs/promises';
import { hasOwnProperty } from '@noelware/utils';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';
import getLogger from './util/log';
import run from './util/run';

const DIST = resolve(process.cwd(), 'dist');
const log = getLogger('build');

run(async () => {
    log.info('Building production-ready distribution...');

    // Step 1. Create the dist/ folder
    if (existsSync(DIST)) {
        await rm(DIST, { recursive: true, force: true });
    }

    await mkdir(DIST);
    await mkdir(resolve(DIST, 'node_modules'));

    const version = await readFile(resolve(process.cwd(), '.hoshi-version'), 'utf8').then((text) => text.trim());

    // Step 2. Create a package.json and collect all dependencies for the
    // workspace.
    const packageJson = {
        name: '@charted/hoshi',
        description: '🐻‍❄️🎨 Official web interface to interact with charted-server, made with Vite and Vue',
        version,
        private: true,
        author: 'Noelware, LLC. <team@noelware.org>',
        repository: 'https://github.com/charted-dev/hoshi',
        bugs: 'https://github.com/charted-dev/hoshi',
        maintainers: [
            {
                email: 'cutie@floofy.dev',
                name: 'Noel Towa',
                url: 'https://floofy.dev'
            }
        ],
        dependencies: {},
        devDependencies: {}
    };

    const allDependencies = execSync('pnpm m ls --json', {
        cwd: process.cwd(),
        timeout: 30000,
        encoding: 'utf-8'
    });

    const parsed = JSON.parse(allDependencies) as Record<string, unknown>[];
    const root = parsed[0] as Record<string, any>;

    for (const [dep, value] of Object.entries(root.devDependencies)) {
        if (!hasOwnProperty<Record<string, unknown>>(packageJson.devDependencies, dep)) {
            packageJson.devDependencies[dep] = (value as Record<string, any>).version;
        }
    }

    const packages = parsed.slice(1) as Record<string, any>[];
    for (const pkg of packages) {
        const path = resolve(pkg.path);
        const pkgJson = await readFile(resolve(path, 'package.json'), 'utf8').then((text) => JSON.parse(text.trim()));
    }
});
