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

import { dirname, relative, resolve } from 'path';
import { warning, error } from '@actions/core';
import { fileURLToPath } from 'url';
import { ESLint } from 'eslint';
import getLogger from './util/log';
import symbols from 'log-symbols';
import run from './util/run';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const log = getLogger('eslint');

// list of directories to look for
const paths = ['src/**/*.{ts,vue,js}', 'scripts/**/*.ts'] as const;

run(async () => {
    const eslint = new ESLint({
        useEslintrc: true,
        fix: process.env.CI === undefined
    });

    for (const glob of paths) {
        log.info(`Linting in with glob pattern [${glob}]`);
        const results = await eslint.lintFiles([glob]);

        for (const result of results) {
            const path = relative(resolve(__dirname, '..', 'src'), result.filePath);
            const hasErrors = result.errorCount > 0;
            const hasWarnings = result.warningCount > 0;
            const symbol = hasErrors ? symbols.error : hasWarnings ? symbols.warning : symbols.success;

            log.info(`${symbol}   ${path}`);
            for (const message of result.messages) {
                const s = message.severity === 1 ? symbols.warning : symbols.error;
                if (process.env.CI !== undefined) {
                    const method = message.severity === 1 ? warning : error;
                    method(`${s} ${message.message} (${message.ruleId})`, {
                        endColumn: message.endColumn,
                        endLine: message.endLine,
                        file: result.filePath,
                        startLine: message.line,
                        startColumn: message.column
                    });
                } else {
                    const method = message.severity === 1 ? log.warn : log.error;
                    method(`    * ${message.message} (${message.ruleId})`);
                }
            }
        }
    }
});
