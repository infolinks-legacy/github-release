// list of snippets that if found in a commit message, will cause that commit not to be included in the release notes
const skippers = [
    "[skip release notes]",
    "[skip relnotes]",
    "[skip changelog]",
    "[skip changes]"
];

/**
 * Collects all commits between configured base commit to the head commit.
 * @param gh GitHub client
 * @param repo repo spec
 * @param base base commit (starting range)
 * @param head head commit (end range)
 * @return {Promise<[]>}
 */
function collectCommitsFromBaseToHead( gh, repo, base, head ) {
    console.info( `Fetching commits '${base}...${head}'...` );
    return new Promise( ( resolve, reject ) => {
        let commits = [];
        const addCommits = ( err, res ) => {
            if( err ) {
                reject( err );
            } else {
                commits = commits.concat( res.data.commits );
                if( gh.hasNextPage( res ) ) {
                    // noinspection JSIgnoredPromiseFromCall
                    gh.getNextPage( res, addCommits );
                } else {
                    console.info( `Found ${commits.length} commits` );
                    resolve( commits );
                }
            }
        };
        const params = Object.assign( {}, repo, { base, head, per_page: 50 } );
        // noinspection JSIgnoredPromiseFromCall
        gh.repos.compareCommits( params, addCommits );
    } );
}

/**
 * Generates a change-log from collected commits.
 * @param commits commits array
 * @return String
 */
function generateChangeLog( commits ) {
    function shouldSkipCommit( msg ) {
        for( let i = 0; i < skippers.length; i++ ) {
            if( msg.indexOf( skippers[ i ] ) >= 0 ) {
                return true;
            }
        }
        return false;
    }

    let changes = "";
    commits.forEach( commitWrapper => {
        let msg = commitWrapper[ "commit" ].message;
        if( !shouldSkipCommit( msg ) ) {
            msg = msg.replace( /\n/g, "<br>" );
            msg = msg.replace( /\|/g, "\\|" );
            let author = commitWrapper.author;
            if( !author ) {
                author = commitWrapper.committer;
            }
            if( !author ) {
                author = { "login": "unknown" };
                console.warn( "did not receive 'author' nor 'committer' for commit: ", commitWrapper );
            }
            changes = `${commitWrapper.sha} | @${author.login}: ${msg}\n` + changes;
        }
    } );
    return "Changes in this release:\n" +
           "\n" +
           "Commit | Change\n" +
           "------ | ------\n" +
           changes;
}

module.exports = {
    collectCommitsFromBaseToHead,
    generateChangeLog
};
