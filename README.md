# github-release

[![Build Status](https://travis-ci.org/infolinks/github-release.svg?branch=master)](https://travis-ci.org/infolinks/github-release)

Create & updates GitHub releases from commits.

This container will find the last published GitHub released on the given
project, and generate a release-notes composed of all commits on the
`master` branch since that release.

The release notes will be placed in the description of a draft release,
if one exists; otherwise, one will be created using the naming
convention of `v1`, `v2`, and so on, starting from the next number after
the last published release. Therefor, if no published release is found,
a new release called `v1` is created.

## Examples

To update release notes for a project, run this:

    docker run infolinks/github-release \
        --token YOUR_GITHUB_ACCESS_TOKEN_HERE \
        --repo YOUR_GITHUB_OWNER_AND_REPO_HERE \
        --commit HEAD_COMMIT_SHA_HERE

For example:

    docker run infolinks/github-release \
        --token abcdefghijklmnopqrstuvwxyz \
        --repo jack/super-repo \
        --commit dkh2kjd92kjakcndj499822nd

The `--repo` argument can receive either a GitHub repository URL (eg. https://github.com/infolinks/github-release.git)
or a GitHub owner/repo pair (eg. "infolinks/github-release").

## Contributions

Any contribution to the project will be appreciated! Whether it's bug
reports, feature requests, pull requests - all are welcome, as long as
you follow our [contribution guidelines for this project](CONTRIBUTING.md)
and our [code of conduct](CODE_OF_CONDUCT.md).



