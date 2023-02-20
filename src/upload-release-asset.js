const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { owner, repo } = github.context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    // const uploadUrl = core.getInput('upload_url', { required: true });
    const assetPath = core.getInput('asset_path', { required: true });
    const assetName = core.getInput('asset_name', { required: true });
    // const assetContentType = core.getInput('asset_content_type', { required: true });

    const tag = core.getInput('tag', { required: true }).replace('refs/tags/', '');
    const contentLength = filePath => fs.statSync(filePath).size;

    const getReleaseResponse = await octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag
    });
    // eslint-disable-next-line no-console
    console.log(`Owner '${owner}', repo: '${repo}', tag: '${tag}'`);

    const {
      data: { id: releaseId }
    } = getReleaseResponse;
    console.log(
      `releaseId '${releaseId}', assetName: ${assetName}, assetPath: ${assetPath}, contentLength '${contentLength}`
    );

    const uploadAssetResponse = await octokit.rest.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: releaseId,
      name: assetName,
      data: fs.readFileSync(assetPath)
    });
    console.log(`uploaded`);

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl }
    } = uploadAssetResponse;
    console.log(`browserDownloadUrl ${browserDownloadUrl}`);

    core.setOutput('browser_download_url', browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
