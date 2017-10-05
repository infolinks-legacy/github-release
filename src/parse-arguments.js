#!/usr/bin/env node
const argsParser = require( "command-line-args" );

/**
 * Converts a given GitHub repository URL or spec (eg. either "https://github.com/org/repo" or just "org/repo") into
 * an object in the form of "{ owner: "org", repo: "repo" }".
 *
 * @param url Github repository URL or spec
 * @return {{owner: *, repo: *}}
 */
function parseGitHubRepositoryUrl( url ) {

    const gitHubUrlMatch = url.match( /^https:\/\/github.com\/([\w_-]+)\/([\w_-]+)(?:.git)?$/ );
    if( gitHubUrlMatch ) {
        return { owner: gitHubUrlMatch[ 1 ], repo: gitHubUrlMatch[ 2 ] };
    }

    const gitHubRepoMatch = url.match( /^([\w_-]+)\/([\w_-]+)$/ );
    if( gitHubRepoMatch ) {
        return { owner: gitHubRepoMatch[ 1 ], repo: gitHubRepoMatch[ 2 ] };
    }

    throw new Error( `illegal repository: ${url}` );
}

// arguments definitions
const argsDef = [
    { name: "verbose", alias: "v", type: Boolean },
    { name: "token", alias: "t", type: String, required: true },
    { name: "repo", alias: "r", type: String, required: true, action: parseGitHubRepositoryUrl },
    { name: "commit", alias: "c", type: String, required: true },
    { name: "releasefile", alias: "f", type: String },
    { name: "publish", alias: "p", type: Boolean, defaultValue: false }
];

/**
 * Parses the arguments from the command-line and returns them as an object.
 * @return {{verbose: *, token: *, repo: *, commit: *, releasefile: *, publish: *}}
 */
function parseArguments() {
    // parse
    const args = argsParser( argsDef );

    // validate
    argsDef.forEach( arg => {
        let argName = arg.name;
        let argValue = args[ argName ];

        if( arg.required && !argValue ) {
            throw new Error( `'--${argName}' is missing!` );
        } else if( arg.action ) {
            args[ argName ] = arg.action( argValue );
        }
    } );

    // return
    return {
        verbose: !!args[ "verbose" ],
        token: args[ "token" ],
        repo: args[ "repo" ],
        commit: args[ "commit" ],
        releasefile: args[ "releasefile" ],
        publish: !!args[ "publish" ]
    };
}

module.exports = parseArguments;
