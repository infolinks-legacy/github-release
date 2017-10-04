node {
    def gitHubToken = credentials( 'github-arikkfir-access-token' )
    def _scm, gitHubRepo, commit, branch

    stage( 'Checkout' ) {
        _scm = checkout scm
        gitHubRepo = ( _scm.GIT_URL =~ /https:\/\/github.com\/(\w+\/\w+).git/ ).with { it[ 0 ][ 1 ] }
        commit = _scm.GIT_COMMIT
        branch = _scm.GIT_BRANCH
    }

    def _image
    stage( 'Build image' ) {
        _image = docker.build( "infolinks/github-release:${ commit }" )
        // can then call methods like image.push() here, or run a command with image.inside():
        //        image.inside( '--net=host -v /mount:/mount:ro' ) {
        //            sh 'some-command.sh'
        //        }
    }
    if( _image && branch == "master" ) {
        stage( 'Generate GitHub release' ) {
            _image.inside {
                // TODO arik: avoid repeating image's entrypoint here; why can't Jenkins just execute the image!?
//                echo "Access token: ${accessToken}"
//                echo " GitHub repo: ${gitHubRepo}"
                sh "/usr/local/app/update-release-notes.js -t ${ gitHubToken } -r ${ gitHubRepo } -c ${ commit } "
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
