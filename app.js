const { env } = process;

const GITHUB_CONTEXT = JSON.parse(env.INPUT_GITHUB_INFO)
const GIST_TOKEN = env.INPUT_GIST_TOKEN

const { event_name: eventName } = GITHUB_CONTEXT;

switch (eventName) {
    case 'pull_request':
        pullRequestAction(GITHUB_CONTEXT);
}


function pullRequestAction(context) {
    console.log('This is PR : ', context.event.number);
}