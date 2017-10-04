#!/usr/bin/env groovy
pipeline {
    agent any

    stages {

        // build our Docker image locally
        stage( 'Build image' ) {
            steps {
                sh "docker build -t infolinks/github-release:local ."
            }
        }

        // create/update GitHub release
        stage( 'Update release notes' ) {
            when {
                branch 'master'
            }
            agent {
                docker {
                    image "infolinks/github-release:local"
                }
            }
            environment {
                GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' )
            }
            steps {
                sh "/usr/local/app/update-release-notes.js -f ${ WORKSPACE }/release -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT }"
            }
        }

        // publish our Docker image to DockerHub (under the release-name tag (v??) and the 'latest' tag)
        stage( 'Publish image' ) {
            when {
                branch 'master'
            }
            steps {
                script {
                    def registryUrl = "https://index.docker.io/v1/"
                    def registryCredentialsId = "dockerhub-infolinksjenkins-username-password"
                    docker.withRegistry( registryUrl, registryCredentialsId ) {
                        def image = docker.image( "infolinks/github-release:local" )
                        image.push( readFile( "${ WORKSPACE }/release" ) )
                        image.push( 'latest' )
                    }
                }
            }
        }

        // publish our GitHub release
        stage( 'Publish GitHub release' ) {
            when {
                branch 'master'
            }
            agent {
                docker {
                    image "infolinks/github-release:local"
                }
            }
            environment {
                GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' )
            }
            steps {
                sh "/usr/local/app/update-release-notes.js -p -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT }"
            }
        }
    }
}
