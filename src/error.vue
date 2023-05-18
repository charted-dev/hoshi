<!--
~ 🐻‍❄️🎨 Hoshi: Official web interface to interact with charted-server, made with Vite and Vue
~ Copyright 2023 Noelware, LLC. <team@noelware.org>
~
~ Licensed under the Apache License, Version 2.0 (the "License");
~ you may not use this file except in compliance with the License.
~ You may obtain a copy of the License at
~
~     http://www.apache.org/licenses/LICENSE-2.0
~
~ Unless required by applicable law or agreed to in writing, software
~ distributed under the License is distributed on an "AS IS" BASIS,
~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
~ See the License for the specific language governing permissions and
~ limitations under the License.
-->

<script setup lang="ts">
import { hasOwnProperty } from '@noelware/utils';
import type { NuxtError } from 'nuxt/dist/app';

const router = useRouter();
const props = defineProps<{
    error: Partial<NuxtError>;
}>();

if (process.dev) {
    console.error(props.error);
}

useHead({
    title:
        props.error?.statusCode === 404
            ? `Page ${(props.error as any).url} was not found`
            : 'Unknown error had occured.'
});

const refresh = () => router.push('/');
</script>
<template>
    <div class="h-screen grid place-content-center">
        <div
            class="flex flex-row py-3 px-4 max-w-6xl max-md:max-w-3xl lg:shadow-md lg:border lg:border-pink-400 lg:rounded-lg max-md:space-x-6"
        >
            <div>
                <img
                    src="https://cdn.floofy.dev/images/trans.png"
                    alt="Noelware"
                    draggable="false"
                    class="rounded-lg w-full h-full"
                />
            </div>
            <div class="mx-auto my-auto ml-3">
                <div v-if="error.statusCode === 404">
                    <h1 class="font-mono text-xl font-semibold">Page {{ (error as any).url }} was not found.</h1>
                    <h2 class="text-lg mt-3">Lost? You can just hit the refresh button below</h2>

                    <button
                        type="button"
                        class="mt-6 max-w-full rounded-lg bg-gray-800 text-white px-3 py-2"
                        @click="refresh"
                    >
                        Refresh!
                    </button>
                </div>
                <div v-else>
                    <h1 class="font-mono text-2xl font-semibold break-words max-w-2xl">
                        Unexpected error had occured while trying to render page.
                    </h1>
                    <h2 class="text-lg mt-3 break-words max-w-sm">
                        Hit the refresh button to try the request again. If this keeps occurring, please report this to
                        Noelware.
                    </h2>

                    <button
                        type="button"
                        class="mt-3 max-w-full rounded-lg bg-gray-800 text-white px-3 py-2"
                        @click="refresh"
                    >
                        Refresh!
                    </button>
                </div>
            </div>

            <div v-if="!hasOwnProperty(error, 'statusCode')">
                <pre><code>let x = 1;</code></pre>
            </div>
        </div>
    </div>
</template>
