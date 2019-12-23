module.exports = { getGists, getGistById, createGist, updateGist };

const https = require('https');

const commonOptions = {
    headers: {
        'User-Agent': 'actions-pipeline',
        'Authorization': `token ${ process.env.INPUT_GIST_TOKEN }`
    },
    hostname: "api.github.com",
    port: 443,
};

function getGists() {
    return new Promise((resolve, reject) => {
        const options = {
            ...commonOptions,
            path: "/gists",
            method: 'GET',
        };

        sendRequest({ options, resolve, reject });
    });
}

function getGistById(gistId) {
    return new Promise((resolve, reject) => {
        const options = {
            ...commonOptions,
            path: `/gists/${gistId}`,
            method: 'GET',
        };

        sendRequest({ options, resolve, reject });
    });
}

function createGist(parameters) {
    return new Promise((resolve, reject) => {
        const options = {
            ...commonOptions,
            headers: {
                ...commonOptions.headers,
                'Content-Type': 'application/json'
            },
            path: '/gists',
            method: 'POST'
        };

        sendRequest({ body: JSON.stringify(parameters), options, resolve, reject });
    });
}

function updateGist(gistId, parameters) {
    return new Promise((resolve, reject) => {
        const options = {
            ...commonOptions,
            headers: {
                ...commonOptions.headers,
                'Content-Type': 'application/json'
            },
            path: `/gists/${gistId}`,
            method: 'PATCH'
        };

        sendRequest({ body: JSON.stringify(parameters), options, resolve, reject });
    });
}

function sendRequest({ options, body, resolve, reject }) {
    const request = https.request(options, responseHandler(resolve));

    request.on('error', (error) => {
        reject(error);
    });

    if (body) {
        request.write(body);
    }
    request.end()
}

function responseHandler(resolve) {
    return (response) => {
        let body = '';
        response.setEncoding('UTF-8');
        response.on('data', (chunk) => {
            body += chunk;
        });
        response.on('end', () => {
            resolve(JSON.parse(body))
        })
    }
}