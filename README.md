# GitHub Release

Create &amp; updates GitHub releases from commits.

This container will find the last published GitHub released on the given
project, and generate a release-notes composed of all commits on the
`master` branch since that release.

The release notes will be placed in the description of a draft release,
if one exists; otherwise, one will be created using the naming
convention of `v1`, `v2`, and so on, starting from the next number after
the last published release. Therefor, if no published release is found,
a new release called `v1` is created.

## Contributions

Any contribution to the project will be appreciated! Whether it's bug
reports, feature requests, pull requests - all are welcome, as long as
you follow our [contribution guidelines for this project](CONTRIBUTING.md)
and our [code of conduct](CODE_OF_CONDUCT.md).
