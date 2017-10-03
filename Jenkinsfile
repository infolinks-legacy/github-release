pipeline {
    agent none
    environment {
        IMG_BASE = "gcr.io/infolinks-gcr/containers"
    }
    options {
        skipStagesAfterUnstable()
        timeout( time: 5, unit: 'MINUTES' )
    }
    stages {
        stage( 'Stage1' ) {
            agent {
                docker {
                    image 'alpine/git'
                }
            }
            steps {
                script {
                    sh('cat /etc/os-release')
                }
            }
        }
    }
}
