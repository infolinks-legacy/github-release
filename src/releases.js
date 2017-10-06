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
                              .then( base => Object.assign( { lastPublishedRelease, base } ) );
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
                              .then( base => Object.assign( { lastPublishedRelease: null, base } ) );
                 }
             } );
}

function findOrCreateDraftRelease( gh, repo, lastPublishedRelease, head, changeLog ) {
    console.info( `Searching for a draft release...` );
    let nextReleaseNumber = 1;
    if( lastPublishedRelease ) {
        const lastPublishedReleaseName = lastPublishedRelease.name;
        const match = lastPublishedReleaseName.match( /^v(\d+)$/ );
        if( !match ) {
            throw new Error( `last published release '${lastPublishedReleaseName}' does not match release numbering scheme (vNN)` );
        } else {
            nextReleaseNumber = parseInt( match[ 1 ] ) + 1;
        }
    }
    return gh.repos.getReleases( repo )
             .then( result => result.data )
             .then( releases => {
                 for( let i = 0; i < releases.length; i++ ) {
                     const rel = releases[ i ];
                     if( rel.name.match( /^v\d+$/ ) ) {
                         if( rel.draft ) {
                             return gh.repos.editRelease(
                                 Object.assign( {}, repo, {
                                     id: rel.id,
                                     tag_name: rel.tag_name,
                                     target_commitish: head,
                                     name: rel.name,
                                     body: changeLog,
                                     draft: rel.draft,
                                     prerelease: rel.prerelease
                                 } )
                             );
                         } else {
                             break;
                         }
                     }
                 }

                 const releaseName = "v" + nextReleaseNumber;
                 console.info( `Creating release '${releaseName}'...` );
                 return gh.repos.createRelease( Object.assign( {}, repo, {
                     tag_name: releaseName,
                     target_commitish: head,
                     name: releaseName,
                     body: changeLog,
                     draft: true,
                     prerelease: false
                 } ) );
             } )
             .then( () => gh.repos.getReleases( repo )
                            .then( result => result.data )
                            .then( releases => releases[ 0 ] ) );
}

/**
 * Publishes the specified release.
 * @param gh github client
 * @param repo repository spec ({owner,repo})
 * @param release release object
 * @return {Promise.<{}>}
 */
function publishRelease( gh, repo, release ) {
    console.info( `Publishing release '${release.name}'...` );
    return gh.repos.editRelease( Object.assign( {}, repo, release, { draft: false } ) )
             .then( nextRelease => gh.repos.getRelease( Object.assign( {}, repo, { id: release.id } ) ) );
}

module.exports = {
    findLastPublishedReleaseAndBaseCommit,
    findOrCreateDraftRelease,
    publishRelease
};
