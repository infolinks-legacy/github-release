#!/usr/bin/env groovy
pipeline {
    agent any

    stages {

        // when NOT "master" branch, build our Docker image locally
        stage( 'Build local image' ) {
            steps {
                sh "docker build --build-arg rel=${env.GIT_COMMIT} -t infolinks/github-release:${ env.GIT_COMMIT } ."
            }
        }

        // create/update GitHub release notes ONLY if on master branch
        stage( 'Update release notes' ) {
            when { branch 'master' }
            agent {
                docker { image "infolinks/github-release:${ env.GIT_COMMIT }" }
            }
            environment { GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' ) }
            steps {
                sh "/usr/local/lib/github-release/update-release-notes.js -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT } -f ${ WORKSPACE }/release"
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
                        def image = docker.image( "infolinks/github-release:${ env.GIT_COMMIT }" )
                        image.push( readFile( "${ WORKSPACE }/release" ) )
                        image.push( 'latest' )
                    }
                }
            }
        }

        // publish our GitHub release
        stage( 'Publish GitHub release' ) {
            when { branch 'master' }
            agent {
                docker { image "infolinks/github-release:${ env.GIT_COMMIT }" }
            }
            environment { GH_ACCESS_TOKEN = credentials( 'github-arikkfir-access-token' ) }
            steps {
                sh "/usr/local/lib/github-release/update-release-notes.js -p -t ${ env.GH_ACCESS_TOKEN_PSW } -r ${ env.GIT_URL } -c ${ env.GIT_COMMIT }"
            }
        }
    }
}
