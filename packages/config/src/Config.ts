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

import { existsSync } from 'fs';
import { load, dump } from 'js-yaml';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import schemas from './schema';
import { z } from 'zod';
import { DeepPartial, ObjectKeysWithSeperator } from '@noelware/utils';
import { KeyToPropType } from '@noelware/utils';
import { OmitUndefinedOrNull } from '@noelware/utils';

const $NotFoundSymbol = Symbol.for('[hoshi]::NotFound');
const schema = z
    .object({
        sentry_dsn: z.string().optional(),
        charted: schemas.charted,
        server: schemas.server
    })
    .strict();

/** Type-alias for the configuration schema */
export type ConfigSchema = z.infer<typeof schema>;

/**
 * Represents a singleton class that is used by the Hoshi web-server to
 * retrieve any configuration key from a pre-loaded file which can be
 * anywhere.
 *
 * @example
 * ```ts
 * import { Config } from '@charted/config';
 *
 * await Config.load('./config/hoshi.yaml');
 * Config.getOrDefault('server.host', '0.0.0.0');
 * // => if set: [whatever] | if not set: [0.0.0.0]
 * ```
 */
export class Config {
    static #config: ConfigSchema | null = null;
    static #resolveDefaultPath() {
        if (process.env.HOSHI_CONFIG_FILE !== undefined) {
            return process.env.HOSHI_CONFIG_FILE!;
        }

        const resolvedConfigDir = resolve(process.cwd(), 'config');
        if (existsSync(resolve(process.cwd(), 'config')) && existsSync(resolve(resolvedConfigDir, 'hoshi.yaml'))) {
            return './config/hoshi.yaml';
        }

        return './config.yml';
    }

    static async #writeAndLoadAgain(path: string) {
        const defaults: DeepPartial<ConfigSchema> = {};
        const dataToWrite = dump(defaults, {
            indent: 4,
            noArrayIndent: true
        });

        await writeFile(path, dataToWrite);
        return this.load(path);
    }

    /**
     * Loads this configuration singleton, will result in a no-op if called
     * more than once.
     *
     * @param path Configuration path to use.
     */
    static async load(path?: string): Promise<void> {
        const loadFrom = path ?? this.#resolveDefaultPath();
        if (!existsSync(loadFrom)) {
            return this.#writeAndLoadAgain(loadFrom);
        }

        const contents = await readFile(loadFrom, 'utf-8');
        const data = load(contents) as unknown;

        return schema.parseAsync(data).then((config) => {
            this.#config = config;
        });
    }

    // static getOrNull<Obj extends ObjectKeysWithSeperator<ConfigSchema>, ReturnType = KeyToPropType<ConfigSchema, Obj>>(
    //     key: Obj
    // ): ReturnType | null {
    //     const nodes = key.split('.');
    //     let value: any = this.#config;

    //     for (const node of nodes) {
    //         try {
    //             value = value[node];
    //         } catch {
    //             value = $NotFoundSymbol;
    //             break;
    //         }
    //     }

    //     return value === $NotFoundSymbol ? null : value === undefined ? null : value;
    // }

    // static getOrDefault<Obj extends ObjectKeysWithSeperator<ConfigSchema>>(
    //     key: Obj,
    //     value: OmitUndefinedOrNull<KeyToPropType<ConfigSchema, Obj>>
    // ) {
    //     return this.getOrNull(key) === null ? (value as KeyToPropType<ConfigSchema, Obj>) : this.getOrNull(key)!;
    // }
}
