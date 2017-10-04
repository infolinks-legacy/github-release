#!/usr/bin/env groovy
node {

    // checkout source code
    def _scm
    stage( 'Checkout' ) {
        _scm = checkout scm
    }

    // build our Docker image locally
    def _image
    stage( 'Build image' ) {
        _image = docker.build( "infolinks/github-release:${ _scm.GIT_COMMIT }" )
    }

    // if we're in the "master" branch, update release notes and push our image to DockerHub
    if( _scm.GIT_BRANCH == "master" ) {

        // discover the GitHub repository name, in the format of "owner/repoName", eg. "infolinks/crond"
        def gitHubRepo = ( _scm.GIT_URL =~ /https:\/\/github.com\/([\w_-]+\/[\w_-]+).git/ )[ 0 ][ 1 ]

        // specification for obtaining the GitHub access token from Jenkins credentials
        def gitHubAccessTokenCredentialsSpec = [ usernamePassword(
                credentialsId: 'github-arikkfir-access-token',
                passwordVariable: 'GH_ACCESS_TOKEN',
                usernameVariable: 'GH_USERNAME'
        ) ]

        // stage for updating the GitHub releases page by creating/updating a release
        def gitHubRelease
        stage( 'Generate GitHub release' ) {
            withCredentials( gitHubAccessTokenCredentialsSpec ) {
                _image.inside( "-v ${ WORKSPACE }:/github:rw" ) {
                    sh "/usr/local/app/update-release-notes.js -t ${ env.GH_ACCESS_TOKEN } -r ${ gitHubRepo } -c ${ _scm.GIT_COMMIT } "
                }
            }
            gitHubRelease = readFile "${ env.WORKSPACE }/release"
        }

        // push our image to DockerHub under the release's tag name as well as "latest"
        stage( 'Push image' ) {
            docker.withRegistry( "https://index.docker.io/v1/", "dockerhub-infolinksjenkins-username-password" ) {
                _image.push( gitHubRelease )
                _image.push( 'latest' )
            }
        }

        // publish our GitHub release
        stage( 'Publish GitHub release' ) {
            withCredentials( gitHubAccessTokenCredentialsSpec ) {
                _image.inside( "-v ${ WORKSPACE }:/github:rw" ) {
                    sh "/usr/local/app/update-release-notes.js -p -t ${ env.GH_ACCESS_TOKEN } -r ${ gitHubRepo } -c ${ _scm.GIT_COMMIT } "
                }
            }
        }
    }
}
