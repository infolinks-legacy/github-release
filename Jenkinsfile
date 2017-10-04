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
    if( _image && _scm.GIT_BRANCH == "master" )
    {
        stage( 'Generate GitHub release' ) {
            _image.inside {
                sh '/usr/local/bin/update-release-notes.js'
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
