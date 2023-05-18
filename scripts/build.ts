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

// import { hasOwnProperty, readdir } from '@noelware/utils';
// import { basename, dirname, relative, resolve } from 'path';
// import run from './util/run';
// import getLogger from './util/log';
// import { existsSync } from 'fs';
// import { rm, mkdir, readFile, writeFile, readdir as fsReaddir, rename, cp } from 'fs/promises';
// import { execSync, spawn, spawnSync } from 'child_process';
// import { bold } from 'colorette';
// import { build } from 'tsup';

// const TITLE = [
//     '/*',
//     ' * 🐻‍❄️🎨 hoshi: Official web interface to interact with charted-server, made with Vite and Vue',
//     ' * Copyright 2023 Noelware, LLC. <team@noelware.org>',
//     ' *',
//     ' * Permission is hereby granted, free of charge, to any person obtaining a copy',
//     ' * of this software and associated documentation files (the "Software"), to deal',
//     ' * in the Software without restriction, including without limitation the rights',
//     ' * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
//     ' * copies of the Software, and to permit persons to whom the Software is',
//     ' * furnished to do so, subject to the following conditions:',
//     ' *',
//     ' * The above copyright notice and this permission notice shall be included in all',
//     ' * copies or substantial portions of the Software.',
//     ' *',
//     ' * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
//     ' * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
//     ' * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
//     ' * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
//     ' * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
//     ' * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE',
//     ' * SOFTWARE.',
//     ' */',
//     '',
//     '/* eslint-ignore */',
//     '// prettier-ignore',
//     ''
// ].join('\n');

// const DIST = resolve(process.cwd(), 'dist');
// const log = getLogger('build');

// run(async () => {
//     // First, we need to create a 'dist/' folder, which will hold
//     // the final result. Since we want to have a unified project
//     // that contains all client and server code, we will need
//     // to build the packages/ first that require `tsup` if
//     // it contains TypeScript files.
//     if (existsSync(DIST)) await rm(DIST, { recursive: true, force: true });

//     await mkdir(DIST);
//     await mkdir(resolve(DIST, 'node_modules'));

//     // Get the version of Hoshi, which will match the API server
//     // version.
//     //
//     // Step 2. Create build information file
//     const version = await readFile(resolve(process.cwd(), '.hoshi-version'), 'utf8').then((text) => text.trim());
//     const commitHash = execSync('git rev-parse --short=8 HEAD', { encoding: 'utf-8' }).trim();
//     const buildDate = new Date();

//     await writeFile(
//         resolve(DIST, 'build-info.json'),
//         JSON.stringify(
//             {
//                 commitHash: commitHash,
//                 buildDate: buildDate.toISOString(),
//                 version
//             },
//             null,
//             4
//         )
//     );

//     log.info(`Wrote build-info.json in ${bold(resolve(DIST, 'build-info.json'))} successfully`);

//     // Step 3. Create a package.json file. We will add the dependencies needed
//     // from all workspaces soon!
//     const packageJson = {
//         name: '@charted/hoshi',
//         description: '🐻‍❄️🎨 Official web interface to interact with charted-server, made with Vite and Vue',
//         version,
//         private: true,
//         author: 'Noelware, LLC. <team@noelware.org>',
//         repository: 'https://github.com/charted-dev/hoshi',
//         bugs: 'https://github.com/charted-dev/hoshi',
//         maintainers: [
//             {
//                 email: 'cutie@floofy.dev',
//                 name: 'Noel Towa',
//                 url: 'https://floofy.dev'
//             }
//         ],
//         dependencies: {},
//         devDependencies: {}
//     };

//     // Step 4. Now we need to collect all packages from all workspaces,
//     // so we can do a `pnpm i` on it.
//     const deps = execSync('pnpm m ls --json', {
//         encoding: 'utf-8',
//         timeout: 30000
//     });

//     const parsed: Record<string, any>[] = JSON.parse(deps);
//     const seen = new Map<string, { type: 'normal' | 'dev'; version: string }>();

//     for (const workspace of parsed) {
//         if (hasOwnProperty(workspace, 'dependencies')) {
//             for (const [name, ver] of Object.entries(workspace.dependencies)) {
//                 if (!seen.has(name)) {
//                     seen.set(name, {
//                         type: 'normal',
//                         version: name.startsWith('@charted') ? version : (ver as any).version
//                     });
//                 }
//             }
//         }

//         if (hasOwnProperty(workspace, 'devDependencies')) {
//             for (const [name, ver] of Object.entries(workspace.devDependencies)) {
//                 if (!seen.has(name)) {
//                     seen.set(name, {
//                         type: 'dev',
//                         version: name.startsWith('@charted') ? version : (ver as any).version
//                     });
//                 }
//             }
//         }
//     }

//     // fix some exceptions
//     const noelUtils = seen.get('@noelware/utils')!.version;
//     const vite = seen.get('vite')!.version;

//     seen.delete('@noelware/utils');
//     seen.set('@noelware/utils', { type: 'normal', version: noelUtils });

//     seen.delete('vite');
//     seen.set('vite', { type: 'normal', version: vite });

//     for (const [dep, dependency] of seen) {
//         // Don't insert it (yet).
//         if (dep.startsWith('@charted')) continue;

//         const key = dependency.type === 'normal' ? 'dependencies' : 'devDependencies';
//         packageJson[key][dep] = dependency.version;
//     }

//     await writeFile(resolve(DIST, 'package.json'), JSON.stringify(packageJson, null, 4));
//     const child = spawn('yarn', {
//         cwd: DIST
//     });

//     log.info('Now installing dependencies for dist/...');
//     await new Promise<void>((resolve, reject) => {
//         child.on('exit', (code) =>
//             code === 0 ? resolve() : reject(new Error(`Received code ${code} when running \`pnpm i\``))
//         );

//         child.once('error', reject);
//         child.stdout.on('data', (chunk) => log.info(chunk.toString().trim()));
//         child.stderr.on('data', (chunk) => log.info(chunk.toString().trim()));
//     });

//     // Step 5. We will need to build all packages
//     // and place them in ./dist/node_modules, if
//     // they contain TypeScript source files.
//     const packages = await fsReaddir(resolve(process.cwd(), 'packages'));
//     for (const pkg of packages) {
//         log.await(`Now building package ${bold(`packages/${pkg}`)}`);
//         const pkgJson = await readFile(resolve('packages', pkg, 'package.json'), 'utf8').then((json) =>
//             JSON.parse(json)
//         );

//         // Write the package.json file if we are in any configuration
//         // package, since we don't have to build anything.
//         const files = await readdir(resolve(process.cwd(), 'packages', pkg));
//         if (!files.some((f) => f.includes('src/index.ts'))) {
//             log.info(`Re-exporting package ${bold(pkgJson.name)} to dist/node_modules/${pkgJson.name}`);

//             // modify package version
//             pkgJson.version = version;
//             if (hasOwnProperty(pkgJson, 'dependencies')) {
//                 for (const name of Object.keys(pkgJson.dependencies)) {
//                     if (name.startsWith('@charted')) {
//                         pkgJson.dependencies[name] = version;
//                     }
//                 }
//             }

//             if (hasOwnProperty(pkgJson, 'devDependencies')) {
//                 for (const name of Object.keys(pkgJson.devDependencies)) {
//                     if (name.startsWith('@charted')) {
//                         pkgJson.devDependencies[name] = version;
//                     }
//                 }
//             }

//             for (const file of files.filter((file) => !file.includes('node_modules'))) {
//                 log.info(`   ... ${resolve(process.cwd(), file)}`);
//                 if (file.includes('package.json')) {
//                     await writeFile(
//                         resolve(process.cwd(), 'dist/node_modules', pkgJson.name, 'package.json'),
//                         JSON.stringify(pkgJson, null, 4)
//                     );

//                     continue;
//                 }

//                 const relativePath = relative(
//                     resolve(process.cwd(), 'packages', pkg),
//                     resolve(process.cwd(), 'packages', pkg, file)
//                 );

//                 const to = resolve(process.cwd(), 'dist/node_modules', pkgJson.name);

//                 if (!existsSync(to)) await mkdir(to, { recursive: true });
//                 await cp(file, resolve(to, relativePath));
//             }
//         } else {
//             log.info('Building project with tsup!');

//             const allSrcFiles = files.filter((f) => !f.includes('node_modules') && f.includes('src'));
//             await build({
//                 platform: 'node',
//                 tsconfig: resolve(process.cwd(), 'packages', pkg, 'tsconfig.json'),
//                 target: ['es2022', 'node16'],
//                 outDir: resolve(process.cwd(), 'dist/node_modules', pkgJson.name, 'dist'),
//                 format: ['cjs', 'esm'],
//                 silent: true,
//                 entry: [allSrcFiles.filter((s) => s.includes('index.ts')).at(0)!],
//                 dts: true,
//                 banner: {
//                     js: TITLE
//                 }
//             });

//             for (const file of files.filter((file) => !file.includes('node_modules') && !file.includes('src/'))) {
//                 log.info(`   ... ${resolve(process.cwd(), file)}`);
//                 if (file.includes('package.json')) {
//                     await writeFile(
//                         resolve(process.cwd(), 'dist/node_modules', pkgJson.name, 'package.json'),
//                         JSON.stringify(pkgJson, null, 4)
//                     );

//                     continue;
//                 }

//                 if (file.includes('tsconfig.json')) {
//                     await writeFile(
//                         resolve(process.cwd(), 'dist/node_modules', pkgJson.name, 'tsconfig.json'),
//                         JSON.stringify(
//                             {
//                                 extends: ['@charted/tsconfig'],
//                                 include: ['**/*.ts']
//                             },
//                             null,
//                             4
//                         )
//                     );

//                     continue;
//                 }

//                 const relativePath = relative(
//                     resolve(process.cwd(), 'packages', pkg),
//                     resolve(process.cwd(), 'packages', pkg, file)
//                 );

//                 const to = resolve(process.cwd(), 'dist/node_modules', pkgJson.name);

//                 if (!existsSync(to)) await mkdir(to, { recursive: true });
//                 await cp(file, resolve(to, relativePath));
//             }
//         }

//         log.success(`Built package ${bold(pkgJson.name)} in dist/node_modules!`);
//     }

//     // Step 6. We now need to build the web UI code and place it
//     // in dist/client

//     // Step 7. We now need to build out the web server and place it
//     // in dist/

//     // Step 8. Add @charted/ libs into the final package.json file
//     const finalized = await readFile(resolve(DIST, 'package.json'), 'utf8').then((text) => JSON.parse(text.trim()));
//     for (const [dep, dependency] of seen) {
//         // Don't insert it (yet).
//         if (!dep.startsWith('@charted')) continue;

//         const key = dependency.type === 'normal' ? 'dependencies' : 'devDependencies';
//         finalized[key][dep] = dependency.version;
//     }

//     await writeFile(resolve(DIST, 'package.json'), JSON.stringify(finalized, null, 4));
// });
