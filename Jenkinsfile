node {
    stage( 'Checkout' ) {
        checkout scm
    }
    stage( 'Build image' ) {
        sh 'ls -l'
    }
}
/*
pipeline {
    agent none
    stages {
        stage( 'Build image' ) {
            steps {
                script {
                    def image = docker.build( "infolinks/github-release:${ env.GIT_COMMIT }", '.' )
                    // can then call methods like image.push() here, or run a command with image.inside():
                    image.inside( '--net=host -v /mount:/mount:ro' ) {
                        sh 'some-command.sh'
                    }
                }
                script {
                    sh( 'ls -l /git' )
                }
            }
        }
        stage( 'Build image' ) {
            agent {
                docker {
                    image 'alpine/git'
                    args '-v ${WORKSPACE}:/git'
                }
            }
            steps {
                script {
                    sh( 'ls -l /git' )
                }
            }
        }
    }
}
*/
