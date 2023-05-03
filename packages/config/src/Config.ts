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

import { DeepPartial, ObjectKeysWithSeperator, KeyToPropType, hasOwnProperty } from '@noelware/utils';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { load, dump } from 'js-yaml';
import { resolve } from 'path';
import schemas from './schema';
import { z } from 'zod';

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

    /**
     * Gets a property from the configuration object, or `null` if it couldn't
     * be found.
     *
     * @param key The dot-notation path to get what configuration value you want
     * @throws {Error} If this configuration singleton wasn't initialized with `Config.load(Path)`.
     * @return The value itself, or `null` if it couldn't be fetched.
     */
    static getOrNull(key: ObjectKeysWithSeperator<ConfigSchema>): KeyToPropType<ConfigSchema, typeof key> | null {
        if (!this.#config) throw new Error('You need to call #load() until you can get variables.');

        const nodes = key.split('.');
        let value: any = this.#config;

        for (const node of nodes) {
            try {
                value = hasOwnProperty(value, node) ? value[node] : undefined;
            } catch {
                value = $NotFoundSymbol;
                break;
            }
        }

        return [undefined, null, $NotFoundSymbol].includes(value) ? null : value;
    }

    /**
     * Grabs a configuration value, or throws a {@link TypeError} if the key couldn't be found.
     * @param key The key to fetch from
     * @throws {Error} If the singleton wasn't initialized
     * @throws {TypeError} If the specified `key` wasn't found.
     * @returns The configuration value you need.
     */
    static get(key: ObjectKeysWithSeperator<ConfigSchema>): NonNullable<KeyToPropType<ConfigSchema, typeof key>> {
        const value = this.getOrNull(key);
        if (value === null) {
            throw new TypeError(`Missing configuration option for key [${key}]`);
        }

        return value as any;
    }

    /**
     * Grabs a configuration value from this singleton, or provides a default value
     * if the configuration property wasn't found.
     * @param key The key to fetch from
     * @param value The default value to use
     * @throws {Error} If the singleton wasn't initialized
     * @returns The value that was fetched, or the default one if it couldn't be found.
     */
    static getOrDefault(
        key: ObjectKeysWithSeperator<ConfigSchema>,
        value: NonNullable<KeyToPropType<ConfigSchema, typeof key>>
    ): NonNullable<KeyToPropType<ConfigSchema, typeof key>> {
        return this.getOrNull(key) ?? value;
    }
}
