const api = require('./api');

const githubContext = JSON.parse(process.env.INPUT_GITHUB_INFO);
const gistName = 'build-version-state';
const commonGistParameters = {
    description: gistName,
    public: false,
};

const branch = getBranchName(githubContext);
const now = new Date(Date.now());
const date = `${now.getFullYear().toString().slice(-2)}-${now.getMonth()+1}-${now.getDate()}`;

getBuildNumber(branch)
    .then(buildNumber => {
        switch (branch.split('/')[0]){
            case 'master':
                return `${date}.${buildNumber}`;
            case 'feature':
                return `PR${githubContext.event.number}.${buildNumber}`;
            case 'release':
                const currentVersion = branch.replace('release/', '');
                return `${currentVersion}-hotfix.${buildNumber}`;
            case 'bugfix':
                return `PR${githubContext.event.number}.${buildNumber}`;
            case 'hotfix':
                return `PR${githubContext.event.number}.${buildNumber}`;
            default:
                console.error('Unsupported branch name' + branch);
                process.exit(1);
        }
    })
    .then(version => {
        console.log(`::set-env name=VERSION::${version}`)
        console.log(`::set-output name=version::${version}`)
    });

async function getBuildNumber(branch) {
    const gistList = await api.getGists();
    const state = gistList.find(gist => gist.description === gistName);

    if (!state) {
        const gistCreationParameters = patchGistFile({ [branch]: 1 });
        await api.createGist(gistCreationParameters);
        return 1;
    }

    const stateGist = await api.getGistById(state.id);

    if (!Object.keys(stateGist.files).includes(process.env.GITHUB_REPOSITORY)){
        await api.updateGist(stateGist.id, patchGistFile({ [branch]: 1 }));

        return 1;
    }

    const repositoryVersions = JSON.parse(stateGist.files[process.env.GITHUB_REPOSITORY].content);

    if (!Object.keys(repositoryVersions).includes(branch)) {
        repositoryVersions[branch] = 1;
        await api.updateGist(stateGist.id, patchGistFile(repositoryVersions));

        return repositoryVersions[branch];
    }

    ++repositoryVersions[branch];
    await api.updateGist(stateGist.id, patchGistFile(repositoryVersions));

    return repositoryVersions[branch]
}

function patchGistFile(fileContent) {
    return {
    ...commonGistParameters,
        files: {
            [process.env.GITHUB_REPOSITORY]: {
                content: JSON.stringify(fileContent)
            }
        },
    };
}

function getBranchName(context) {
    switch(context.event_name) {
        case 'pull_request':
            return context.head_ref;
        case 'push':
            return context.ref.replace('refs/heads/', '');
        default:
            console.log('Something went wrong :( Unsupported Github event type');
            process.exit(1);
            break;
    }
}