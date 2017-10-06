#!/usr/bin/env groovy
pipeline {
    agent any

    stages {

        // when NOT "master" branch, build our Docker image locally
        stage( 'Build local image' ) {
            steps {
                sh "docker build -t infolinks/github-release:local ."
            }
        }

        // create/update GitHub release notes ONLY if on master branch
        stage( 'Update release notes' ) {
            when { branch 'master' }
            agent {
                docker { image "infolinks/github-release:local" }
            }
            environment { GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' ) }
            steps {
                sh "/usr/local/lib/github-release/update-release-notes.js -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT } -f ${ WORKSPACE }/release"
            }
        }

        // when IN "master" branch we have a more complex workflow
        stage( 'Build master image' ) {
            when { branch 'master' }
            steps {
                sh "docker build -t infolinks/github-release:\$(cat ${WORKSPACE}/release) ."
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
                    def release = readFile( "${ WORKSPACE }/release" )
                    docker.withRegistry( registryUrl, registryCredentialsId ) {
                        def image = docker.image( "infolinks/github-release:"+ release )
                        image.push( release )
                        image.push( 'latest' )
                    }
                }
            }
        }

        // publish our GitHub release
        stage( 'Publish GitHub release' ) {
            when { branch 'master' }
            agent {
                docker { image "infolinks/github-release:local" }
            }
            environment { GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' ) }
            steps {
                sh "/usr/local/lib/github-release/update-release-notes.js -p -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT }"
            }
        }
    }
}
