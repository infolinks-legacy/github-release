node {
    def _scm
    stage( 'Checkout' ) {
        _scm = checkout scm
    }
    stage( 'Build image' ) {
        docker.build( "infolinks/github-release:${ _scm.GIT_COMMIT }" )
        // can then call methods like image.push() here, or run a command with image.inside():
//        image.inside( '--net=host -v /mount:/mount:ro' ) {
//            sh 'some-command.sh'
//        }
    }
    if( _scm.GIT_BRANCH == "master" )
    {
        echo "master branch!"
    }
}
