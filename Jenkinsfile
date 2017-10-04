#!/usr/bin/env groovy
node {
    def _scm
    stage( 'Checkout' ) {
        _scm = checkout scm
    }

    def _image
    stage( 'Build image' ) {
        _image = docker.build( "infolinks/github-release:${ _scm.GIT_COMMIT }" )
        // can then call methods like image.push() here, or run a command with image.inside():
        //        image.inside( '--net=host -v /mount:/mount:ro' ) {
        //            sh 'some-command.sh'
        //        }
    }
    if( _image && _scm.GIT_BRANCH == "master" ) {
        stage( 'Generate GitHub release' ) {
            def gitHubRepo = ( _scm.GIT_URL =~ /https:\/\/github.com\/([\w_-]+\/[\w_-]+).git/ )[ 0 ][ 1 ]
            withCredentials(
                    [ usernamePassword(
                            credentialsId: 'github-arikkfir-access-token',
                            passwordVariable: 'GH_ACCESS_TOKEN'
                    ) ]
            ) {
                _image.inside {
                    // TODO arik: avoid repeating image's entrypoint here; why can't Jenkins just execute the image!?
                    echo "Access token: ${ env.GH_ACCESS_TOKEN }"
                    echo " GitHub repo: ${ gitHubRepo }"
                    sh "/usr/local/app/update-release-notes.js -t ${ env.GH_ACCESS_TOKEN } -r ${ gitHubRepo } -c ${ _scm.GIT_COMMIT } "
                }
            }
            // TODO arik: obtain release from "./release
        }
        //        stage( 'Push image' ) {
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
