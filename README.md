# Jest Coverage Ratchet

In a pull request, this action will compare the Jest coverage report in the default branch and the current branch. If any of the metrics (statements, branches, functions, and lines) in the "total" coverage have declined, this action will produce a status failure which can be used to block a pull request.

Bits and pieces taken from the excellent [jest-coverage-report-action](https://github.com/ArtiomTr/jest-coverage-report-action) .

## Feature

### Create a Pull Request comment

A pull request will create a comment comparing the coverage of the current branch with the default branch.

## Usage

### Inputs

|Parameter|Required|Default Value|Description|
|:--:|:--:|:--:|:--|
|working_directory|true|N/A|The location of the package containing a coverage report.|
|coverage_summary_path|false|coverage/coverage-summary.json|The location (relative to the `working_directory`) of the Jest coverage report.|
|test_script|true|N/A|The script that generates the coverage report. Include your package manager (ex: `yarn test`)|
|default_branch|false|main|The name of the default branch. Usually `main`, but somtimes `master`.|
|github_token|false|${{ github.token }}|GitHub Access Token.<br>${{ secrets.GITHUB_TOKEN }} is recommended.|
|margin|false|0|The directory which contains package.json|


## Example Workflow
Because this action is not published for public use, the [Private Actions Checkout](https://github.com/daspn/private-actions-checkout) action must be used to pull it in for internal Millerknoll projects.

```yaml
name: npm audit

on:
  push:
    branches: ["main"]
  pull_request:
    types: [opened, synchronize]

jobs:
  build:
    name: Run Jest Coverage Ratchet
    permissions:
      checks: write
      pull-requests: write
      contents: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Private actions checkout
        uses: daspn/private-actions-checkout@v2
        with:
          actions_list: '["MillerKnoll-Digital/npm-audit-action@v1.0.0"]'
          checkout_base_path: ./.github/actions
          app_id: ${{ secrets.MK_PRIVATE_ACTION_APP_ID }}
          app_private_key: ${{ secrets.MK_PRIVATE_ACTION_KEY }}

      - name: Validation
        run: |
          ls -lR ./.github/actions

      - name: Setup Node.js environment
        uses: actions/setup-node@v2
        with:
            node-version: 16

      - name: Install dependencies
        run: yarn

      - name: Coverage Ratchet
        uses: ./.github/actions/action-coverage-ratchet
        with:
          test_script: yarn test
          working_directory: path/to/package
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Publishing to GitHub
1. Ensure that you are on the `main` branch.
2. `yarn release` - lints, tests and builds code to stage alongside `CHANGELOG.md` and bumped version files. Creates a tag.
3. Run `git push --follow-tags origin main` to push the tag to remote.

- - -

This action is extended from [MillerKnoll-Digital/npm-audit-action](https://github.com/MillerKnoll-Digital/npm-audit-action).
