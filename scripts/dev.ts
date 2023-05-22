/*
 * 🐻‍❄️🎨 hoshi: Official web interface to interact with charted-server, made with Nuxt
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

import { type ChildProcessByStdio, spawn, Serializable } from 'child_process';
import { context, type BuildOptions } from 'esbuild';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { aliasPath } from 'esbuild-plugin-alias-path';
import { JS_BANNER } from './util/constants';
import EventEmitter from 'events';
import getLogger from './util/log';
import run from './util/run';
import { hasOwnProperty, isObject } from '@noelware/utils';

const kRestartServer = Symbol.for('$hoshi::kRestartServer');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const log = getLogger('dev');
const EE = new EventEmitter();

let serverChildProcess: ChildProcessByStdio<null, null, null> | null = null;
const kDefaultBuildOptions = {
    entryPoints: [resolve(__dirname, '..', 'server', 'main.ts')],
    treeShaking: true,
    tsconfig: resolve(__dirname, '..', 'server', 'tsconfig.json'),
    platform: 'node',
    charset: 'utf8',
    format: 'esm',
    outdir: resolve(__dirname, '..', 'dist'),
    define: {
        'process.env.NODE_ENV': JSON.stringify('development')
    },
    plugins: [
        aliasPath({
            cwd: resolve(__dirname, '..', 'server'),
            alias: {
                '~/': resolve(__dirname, '..', 'server')
            }
        }),

        // https://github.com/evanw/esbuild/issues/3008#issuecomment-1477448237
        {
            name: 'hoshi:build:finished',
            setup({ onEnd }) {
                onEnd(() => {
                    EE.emit(kRestartServer);
                });
            }
        }
    ],
    banner: {
        js: JS_BANNER
    }
} satisfies BuildOptions;

const restartNodeServer = async () => {
    // I would like to check if it was successfully terminated,
    // but Node.js doesn't gurantee that ChildProcess.killed will
    // return true if it was successfully terminated, I was originally
    // going to do:
    //
    //     while (!serverChildProcess?.killed) { /* some code here */ }
    //
    // Should there be a timeout (i.e ~12000ms) to see if it was killed
    // successfully, if not, then terminate the dev server process?
    serverChildProcess?.kill();
    serverChildProcess = null;

    log.info('Starting hoshi web server!');
    serverChildProcess = spawn('node', ['main.js'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        cwd: resolve(__dirname, '..', 'dist')
    });

    await new Promise<void>((resolve, reject) => {
        const handler = (message: Serializable) => {
            if (!isObject(message)) return;

            const msg = message as Record<string, unknown>;
            if (!hasOwnProperty(msg, 'type')) {
                // Don't react to new messages
                serverChildProcess!.off('message', handler);
                return reject(new Error(`Response didn't give a \`type\` key\n${JSON.stringify(msg)}`));
            }

            const type = msg.type as string;
            if (type !== 'started') {
                serverChildProcess!.off('message', handler);
                log.error(
                    `Hoshi web server didn't start correctly. Received serialized response:`,
                    JSON.stringify(msg)
                );

                return reject();
            }

            serverChildProcess!.off('message', handler);
            resolve();
        };

        serverChildProcess!.on('message', handler);
    });
};

run(async () => {
    log.info('Starting hoshi development server!');

    EE.on(kRestartServer, restartNodeServer);

    // Since we do a Nuxt build when the server launches,
    // we will have to create an ESBuild watcher.
    const ctx = await context(kDefaultBuildOptions);
    await ctx.watch();
    await restartNodeServer();

    process.on('SIGKILL', async () => {
        log.warn('Killing dev server!');
        await ctx.dispose();

        process.exit(0);
    });
});
