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

import z from 'zod';

/**
 * Represents the configuration schema for the `server` configuration block.
 */
export type ServerConfigSchema = z.infer<typeof serverConfigSchema>;

/**
 * Represents the configuration schema for the `charted` configuration block.
 */
export const serverConfigSchema = z.object({
    host: z.string().default('0.0.0.0'),
    port: z.number().min(1024).max(65535).default(2134),
    headers: z.record(z.string(), z.string())

    // TODO(@auguwu): add ssl transport to charted-server
});
