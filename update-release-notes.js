#!/usr/bin/env node

// list of snippets that if found in a commit message, will cause that commit not to be included in the release notes
const skippers = [
    "[skip release notes]",
    "[skip relnotes]",
    "[skip changelog]",
    "[skip changes]"
];

// parse command-line options
const options = require( "command-line-args" )( [
                                                    { name: "token", alias: "t", type: String },
                                                    { name: "repo", alias: "r", type: String },
                                                    { name: "commit", alias: "c", type: String },
                                                    { name: "verbose", alias: "v", type: Boolean }
                                                ] );

// validate we all options
if( !options[ "token" ] ) {
    console.error( `access token missing!` );
    process.exit( 1 );
} else if( !options[ "repo" ] ) {
    console.error( `repository name missing!` );
    process.exit( 1 );
} else if( !options[ "commit" ] ) {
    console.error( `commit SHA missing!` );
    process.exit( 1 );
} else if( options[ "verbose" ] ) {
    console.info( `Access token: ${"*".repeat( options[ "token" ].length )}` );
    console.info( `Repository: ${options[ "owner" ]}/${options[ "repo" ]}` );
    console.info( `Commit SHA: ${options[ "commit" ]}` );
}
options[ "owner" ] = options[ "repo" ].substring( 0, options[ "repo" ].indexOf( "/" ) );
options[ "repo" ] = options[ "repo" ].substring( options[ "repo" ].indexOf( "/" ) + 1 );


// setup GitHub client
const GitHubApi = require( "github" );
const gitHub = new GitHubApi( { debug: false } );
gitHub.authenticate( { type: "token", token: options[ "token" ], Promise } );

// start processing
Promise.resolve( {
                     verbose: options[ "verbose" ],
                     owner: options[ "owner" ],
                     repo: options[ "repo" ],
                     head: options[ "commit" ],
                     ref: "master"
                 } )
       .then( findLastPublishedRelease )         // adds "prevRelease, ref, head" to result
       .then( findBaseCommitForRelease )         // adds "base" to result
       .then( findAllCommitsForRelease )         // adds "commits" to result
       .then( draftChangeLogForRelease )         // adds "changeLog" to result
       .then( findOrCreateDraftRelease )         // adds "nextRelease" to result
       .then( () => {
           if( options[ "verbose" ] ) {
               console.info( "Done." );
           }
           process.exit( 0 );
       } )
       .catch( err => {
           console.error( `ERROR! `, err );
           process.exit( 1 );
       } );

function findLastPublishedRelease( { verbose, owner, repo, ref, head } ) {
    // TODO arik: include published pre-releases as well
    console.info( `Fetching latest release...` );
    return gitHub.repos.getLatestRelease( { owner, repo } )
                 .then( result => result.data )
                 .then( prevRelease => {
                     return { verbose, owner, repo, prevRelease };
                 } )
                 .catch( err => {
                     if( err && err.code === 404 ) {
                         return { owner, repo, prevRelease: null };
                     } else {
                         throw err;
                     }
                 } )
                 .then( result => Object.assign( {}, result, { ref, head } ) );
}

function findBaseCommitForRelease( { owner, repo, prevRelease, ref, head } ) {
    return Promise.resolve( prevRelease ? prevRelease.tag_name : undefined )
                  .then( tagName => {
                      if( tagName ) {
                          console.info( `Fetching commit SHA for tag: ${tagName}` );
                          return gitHub.repos
                                       .getShaOfCommitRef( { owner, repo, ref: tagName } )
                                       .then( result => result.data.sha );
                      } else {
                          console.info( `Finding first commit on '${ref}'...` );
                          return gitHub.repos
                                       .getCommits( { owner, repo, sha: ref, per_page: 1 } )
                                       .then( result => {
                                           if( gitHub.hasLastPage( result ) ) {
                                               return gitHub.getLastPage( result ).then( result => result.data );
                                           } else {
                                               throw new Error( `no previous release found, and failed to infer first commit of '${ref}'` );
                                           }
                                       } )
                                       .then( commits => {
                                           if( commits.length === 1 ) {
                                               return commits[ 0 ];
                                           } else {
                                               throw new Error( "illegal state - too few or too many commits found: ", commits );
                                           }
                                       } )
                                       .then( commit => commit.sha );
                      }
                  } )
                  .then( base => {
                      return { owner, repo, prevRelease, ref, base, head };
                  } );
}

function findAllCommitsForRelease( { owner, repo, prevRelease, ref, base, head } ) {
    console.info( `Comparing commits between ${base} and ${head}...` );
    return gitHub.repos
                 .compareCommits( { owner, repo, base, head } )
                 .then( result => result.data.commits ) // TODO arik: must add paginataion over commits
                 .then( commits => {
                     return { owner, repo, prevRelease, ref, base, head, commits };
                 } );
}

function shouldSkipCommit( msg ) {
    for( let i = 0; i < skippers.length; i++ ) {
        if( msg.indexOf( skippers[ i ] ) >= 0 ) {
            return true;
        }
    }
    return false;
}

function draftChangeLogForRelease( { owner, repo, prevRelease, ref, base, head, commits } ) {
    let changes = "";
    commits.forEach( commitWrapper => {
        let msg = commitWrapper[ "commit" ].message;
        if( !shouldSkipCommit( msg ) ) {
            msg = msg.replace( /\n/g, "<br>" );
            msg = msg.replace( /\|/g, "\\|" );
            let author;

            author = commitWrapper.author;
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

    const changeLog = "Changes in this release:\n" +
                      "\n" +
                      "Commit | Change\n" +
                      "------ | ------\n" +
                      changes;
    return { owner, repo, prevRelease, ref, base, head, commits, changeLog };
}

function findOrCreateDraftRelease( { owner, repo, prevRelease, ref, base, head, commits, changeLog } ) {
    console.info( `Fetching releases...` );
    return gitHub.repos
                 .getReleases( { owner, repo } )
                 .then( result => result.data )
                 .then( releases => releases.filter( release => release.draft ) )
                 .then( drafts => drafts.length === 0 ? undefined : drafts[ 0 ] )
                 .then( draft => {
                     if( draft ) {
                         console.info( `Updating release '${draft.name}'...` );
                         return gitHub.repos.editRelease(
                             {
                                 owner,
                                 repo,
                                 id: draft.id,
                                 tag_name: draft.tag_name,
                                 target_commitish: head,
                                 name: draft.name,
                                 body: changeLog,
                                 draft: draft.draft,
                                 prerelease: draft.prerelease
                             }
                         );
                     } else {
                         let releaseName = "v1";
                         if( prevRelease ) {
                             const versionRegex = /^v(\d+)$/;
                             const match = versionRegex.exec( prevRelease.name );
                             releaseName = match && match[ 1 ] ? "v" + (parseInt( match[ 1 ] ) + 1) : "v1";
                         }
                         let releaseSpec = {
                             owner,
                             repo,
                             tag_name: releaseName,
                             target_commitish: head,
                             name: releaseName,
                             body: changeLog,
                             draft: true,
                             prerelease: false
                         };
                         console.info( `Creating release '${releaseName}'...` );
                         return gitHub.repos.createRelease( releaseSpec );
                     }
                 } )
                 .then( nextRelease => {
                     return { owner, repo, prevRelease, ref, base, head, commits, changeLog, nextRelease };
                 } );
}
