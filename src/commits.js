/**
 * Finds the last published release and its referenced commit SHA, adding them to the context.
 * @param gh GitHub client
 * @param repo repository spec (owner, repo)
 * @return {Promise<{lastPublishedRelease,base}>}
 */
function findLastPublishedReleaseAndBaseCommit( gh, repo ) {
    console.info( `Fetching latest published release...` );
    return gh.repos.getReleases( repo )
             .then( result => result.data )
             .then( releases => releases.filter( rel => !rel.draft ) )
             .then( releases => releases.filter( rel => rel.name.match( /^v\d+$/ ) ) )
             .then( releases => releases.length ? releases[ 0 ] : undefined )
             .then( lastPublishedRelease => {
                 if( lastPublishedRelease ) {
                     let releaseName = lastPublishedRelease.name;
                     let tagName = lastPublishedRelease.tag_name;
                     console.info( `Fetching commit SHA of tag '${tagName}' from release '${releaseName}'` );
                     return gh.repos.getShaOfCommitRef( Object.assign( {}, repo, { ref: tagName } ) )
                              .then( result => result.data.sha )
                              .then( base => Object.assign( {}, { lastPublishedRelease, base } ) );
                 } else {
                     console.info( `No published release found; finding first commit on 'master'...` );
                     return gh.repos.getCommits( Object.assign( {}, repo, { sha: "master", per_page: 1 } ) )
                              .then( result => {
                                  if( gh.hasLastPage( result ) ) {
                                      return gh.getLastPage( result ).then( result => result.data[ 0 ] );
                                  } else {
                                      throw new Error( `failed to find first commit of 'master'` );
                                  }
                              } )
                              .then( commit => commit.sha )
                              .then( base => Object.assign( {}, { lastPublishedRelease: null, base } ) );
                 }
             } );
}

function findOrCreateDraftRelease() {
    // TODO arik: implement
}

exports = {
    findLastPublishedReleaseAndBaseCommit,
    findOrCreateDraftRelease
};
