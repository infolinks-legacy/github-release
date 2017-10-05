const GitHub = require( "github" );

/**
 * Creates the GitHub client, authenticated using the given access token.
 * @param token
 * @return {*}
 */
function createGitHubClient( token ) {
    const gh = new GitHub( { debug: false } );
    gh.authenticate( { type: "token", token, Promise } );
    return gh;
}

module.exports = createGitHubClient;
