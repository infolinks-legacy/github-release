pipeline {
    agent none
//    environment {
//        IMG_BASE = "gcr.io/infolinks-gcr/containers"
//    }
    stages {
        stage( 'Build image' ) {
            agent {
                docker {
                    image 'alpine/git'
                    args '-v ${WORKSPACE}:/git'
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
