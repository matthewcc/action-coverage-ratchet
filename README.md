# Jest Coverage Ratchet

In a pull request, this action will compare the Jest coverage report in the target branch and the current branch, producing a "failure" status if the code coverage has declined.

## Feature

### Create a Pull Request comment

If vulnerabilities are found by audit, Action triggered by PR creates a comment.

### Create an Issue

If vulnerabilities are found by audit, Action triggered by push, schedule creates the following GitHub Issue.

![image](https://github.com/hmibrand/npm-audit-action/blob/main/issue.png)

## Usage

### Inputs

|Parameter|Required|Default Value|Description|
|:--:|:--:|:--:|:--|
|package_manager|false|npm|The package manager to run the `audit` command with|
|audit_level|false|low|The value of `--audit-level`(npm) or `--level`(yarn) flag|
|production_flag|false|false|Run audit with `--production`(npm) or `--groups dependencies`(yarn) flag|
|json_flag|false|false|Run audit with `--json`|
|issue_assignees|false|N/A|Issue assignees (separated by commma)|
|issue_labels|false|N/A|Issue labels (separated by commma)|
|issue_title|false|npm audit found vulnerabilities|Issue title|
|github_token|true|N/A|GitHub Access Token.<br>${{ secrets.GITHUB_TOKEN }} is recommended.|
|working_directory|false|N/A|The directory which contains package.json|
|dedupe_issues|false|false|If 'true', action will not create a new issue when one is already open|
|create_issues|false|true|Flag to create issues if vulnerabilities are found.|
|create_pr_comments|false|true|If 'false', action will not create a pr comment even if vulnerabilities are found|
|fail_pr_action|false|true|Determines if the entire action will fail if vulnerabilities are found for PR events|

### Outputs

|Parameter name|Description|
|:--:|:--|
|npm_audit|The output of the npm audit report in a text format|

## Example Workflow
Because this action is not published for public use, the [Private Actions Checkout](https://github.com/daspn/private-actions-checkout) action must be used to pull it in for internal Millerknoll projects.

```yaml
name: npm audit

on:
  pull_request:
  push:
    branches:
      - main
      - 'releases/*'
# on:
#   schedule:
#     - cron: '0 10 * * *'

jobs:
  scan:
    name: audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Private actions checkout
        uses: daspn/private-actions-checkout@v2
        with:
          actions_list: '["hmibrand/npm-audit-action@v1.0.1"]'
          checkout_base_path: ./.github/actions
          app_id: ${{ secrets.MK_PRIVATE_ACTION_APP_ID }}
          app_private_key: ${{ secrets.MK_PRIVATE_ACTION_KEY }}

      - name: Validation
        run: |
          ls -lR ./.github/actions

      - name: Audit
        uses: ./.github/actions/npm-audit-action
        with:
          package_manager: yarn
          audit_level: high
          github_token: ${{ secrets.GITHUB_TOKEN }}
          issue_assignees: user1,user2
          issue_labels: vulnerability,test
          dedupe_issues: true
```

## Publishing to GitHub
1. Ensure that you are on the `main` branch.
2. `yarn release` - lints, tests and builds code to stage alongside `CHANGELOG.md` and bumped version files. Creates a tag.
3. Run `git push --follow-tags origin main` to push the tag to remote.

- - -

This action is extended from [oke-py/npm-audit-action](https://github.com/oke-py/npm-audit-action).
