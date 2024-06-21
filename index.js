const path = require("path");

const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");
const toolCache = require("@actions/tool-cache");
const semver = require("semver");

function findArchive({version, nodePlatform}) {
    const wabtPlatform = nodePlatformToWabtPlatform({nodePlatform, version});
    const directoryName = `wabt-${version}`;

    return [directoryName, `https://github.com/WebAssembly/wabt/releases/download/${version}/${directoryName}-${wabtPlatform}.tar.gz`]
}

function nodePlatformToWabtPlatform({nodePlatform, version}) {
    switch (nodePlatform) {
        case "darwin":
            return semver.gte(version, "1.0.30") ? "macos-12" : "macos";
        case "linux":
            return semver.gte(version, "1.0.35") ? "ubuntu-20.04" : "ubuntu";
        case "win32":
            return "windows";
        default:
            throw new Error("unrecognised platform: " + nodePlatform);
    }
}

async function install() {
    try {
        const version = core.getInput("wabt-version");
        const nodePlatform = process.platform;
        const [archiveDirectory, archiveUrl] = findArchive({version, nodePlatform});
        core.info(`Download from ${archiveUrl}`);
        const archivePath = await toolCache.downloadTool(archiveUrl);
        const tempDir = await toolCache.extractTar(archivePath, undefined, "xz");
        const toolPath = await toolCache.cacheDir(path.join(tempDir, archiveDirectory), "wabt", version);
        core.addPath(path.join(toolPath, "bin"));
    } catch (error) {
        core.setFailed(error.message);
    }
}

install();

