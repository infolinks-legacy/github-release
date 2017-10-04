#!/usr/bin/env groovy
node {
    def _scm
    stage( 'Checkout' ) {
        _scm = checkout scm
    }

    def _image
    stage( 'Build image' ) {
        _image = docker.build( "infolinks/github-release:${ _scm.GIT_COMMIT }" )
    }

    if( _image && _scm.GIT_BRANCH == "master" ) {
        def gitHubRepo = ( _scm.GIT_URL =~ /https:\/\/github.com\/([\w_-]+\/[\w_-]+).git/ )[ 0 ][ 1 ]
        def gitHubAccessTokenCredentialsSpec = [ usernamePassword(
                credentialsId: 'github-arikkfir-access-token',
                passwordVariable: 'GH_ACCESS_TOKEN',
                usernameVariable: 'GH_USERNAME'
        ) ]

        def gitHubRelease
        stage( 'Generate GitHub release' ) {
            withCredentials( gitHubAccessTokenCredentialsSpec ) {
                _image.inside( "-v ${ WORKSPACE }:/github:rw" ) {
                    sh "/usr/local/app/update-release-notes.js -t ${ env.GH_ACCESS_TOKEN } -r ${ gitHubRepo } -c ${ _scm.GIT_COMMIT } "
                }
            }
            gitHubRelease = readFile "${ env.WORKSPACE }/release"
            echo gitHubRelease
        }

//        stage( 'Push image' ) {
//            // TODO arik: obtain release from "./release
//            docker.withRegistry( credentialsId: 'dockerhub-infolinksjenkins-username-password' ) {
//                // TODO arik: also push with release tag
//                _image.push( 'latest' )
//            }
//        }
        //        stage( 'Publish GitHub release' ) {
        //            docker.image( "infolinks/github-release" ).inside( '--token abc' ) {
        //
        //            }
        //        }
    }
}
