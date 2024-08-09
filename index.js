const path = require("path");

const core = require("@actions/core");
const toolCache = require("@actions/tool-cache");
const semver = require("semver");
const platform = require("./platform");

function findArchive({version, platformInfo}) {
    const wabtPlatform = githubPlatformToWabtPlatform({platformInfo, version});
    const directoryName = `wabt-${version}`;

    return [directoryName, `https://github.com/WebAssembly/wabt/releases/download/${version}/${directoryName}-${wabtPlatform}.tar.gz`]
}

function githubPlatformToWabtPlatform({platformInfo, version}) {
    switch (platformInfo.platform) {
        case "darwin":
            if (semver.lt(version, "1.0.30")) {
                return "macos";
            }

            const osver = parseInt(platformInfo.version.split(".")[0]);
            if (osver < 14 || semver.lt(version, "1.0.35")) {
                return "macos-12";
            }

            return "macos-14";
        case "linux":
            return semver.gte(version, "1.0.35") ? "ubuntu-20.04" : "ubuntu";
        case "win32":
            return "windows";
        default:
            throw new Error("unrecognised platform: " + platformInfo.platform);
    }
}

async function install() {
    try {
        const version = core.getInput("wabt-version");
        const platformInfo = await platform.getDetails();
        const [archiveDirectory, archiveUrl] = findArchive({version, platformInfo});
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
