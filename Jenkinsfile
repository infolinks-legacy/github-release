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
        stage( 'Push image' ) {
            _image.push( 'latest' )
        }
        stage( 'Update release notes' ) {
            docker.image( "infolinks/github-release" ).inside( '--token abc' ) {

            }
        }
    }
}
