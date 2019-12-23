# versioning-action

Action created for easier versioning in trunk-based flow

Parameters:
 - `github_info` - `github` context of build
 - `gist_token` - Github personal API token with `gist` scope (acts like back-end)

Outputs:
 - step output `version`
 - environment variable `VERSION` which will be available in flow