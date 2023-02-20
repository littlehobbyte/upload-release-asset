const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { owner, repo } = github.context.repo;
    const assetPath = core.getInput('asset_path', { required: true });
    const assetName = core.getInput('asset_name', { required: true });
    const tag = core.getInput('tag', { required: true }).replace('refs/tags/', '');

    const getReleaseResponse = await octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag
    });

    const {
      data: { id: releaseId }
    } = getReleaseResponse;

    const uploadAssetResponse = await octokit.rest.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: releaseId,
      name: assetName,
      data: fs.readFileSync(assetPath)
    });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl }
    } = uploadAssetResponse;

    core.setOutput('browser_download_url', browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
