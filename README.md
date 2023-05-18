# 🐻‍❄️🎨 hoshi

> _Official web interface to interact with charted-server, made with [Nuxt.js](https://nuxt.com)_

**hoshi** is the official web interface to easily interact with [charted-server](https://charts.noelware.org) without executing cURL commands yourself with a pretty UI for everything.

**hoshi** is always compatible with the latest version of [charted-server](https://charts.noelware.org), it provides the same release cycle and versioning, to not get confused. It is generally recommended to run both [charted-server](https://charts.noelware.org) and **Illustration** with the same versions.

## Version Compatibility Chart

| API Server Version | Web UI Version | Is it compatible? why or why not?                                              |
| ------------------ | -------------- | ------------------------------------------------------------------------------ |
| `0.4-nightly`      | `0.4-nightly`  | Yes! It has matching versions.                                                 |
| `1.2.3`            | `2.3.0`        | No since the web UI is running on a major release than the API server.         |
| `1.2.3`            | `1.4.2`        | Yes, but it will give you a warning that the minor versions are not the same . |
| `1.2.3`            | `1.2.4`        | Yes since the patch version doesn't matter, it only contains _patches_         |
| `2.3.4`            | `1.2.3`        | No since the API server's version is much higher than the web UI version.      |

> **Note**: If you run a stable build and a nightly/unstable build, the web UI will refuse to run.
