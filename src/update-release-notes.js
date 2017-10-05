#!/usr/bin/env node
const fs = require( "fs" );
const readPackageRelease = require( "./read-package-release" );
const parseCommandLineArgs = require( "./parse-arguments" );
const createGitHubClient = require( "./github-client" );
const releases = require( "./releases" );
const commits = require( "./commits" );

/**
 * Prints configuration.
 * @param ctx context
 * @return {*}
 */
function printConfiguration( ctx ) {
    console.info( `Package release: ${ctx.packageRelease}` );
    console.info( `        Verbose: ${ctx.args.verbose}` );
    console.info( `   Access token: ${"*".repeat( ctx.args.token.length )}` );
    console.info( `     Repository: ${ctx.args.repo.owner}/${ctx.args.repo.repo}` );
    console.info( `     Commit SHA: ${ctx.args.commit}` );
    console.info( `   Release file: ${ctx.args.releasefile}` );
    console.info( `       Publish?: ${ctx.args.publish}` );
    return ctx;
}

/**
 * Write the given release name to the specified file.
 * @param releaseFile target file
 * @param releaseName release name
 * @return {Promise}
 */
function writeReleaseFile( releaseFile, releaseName ) {
    return new Promise( ( resolve, reject ) => {
        if( releaseFile ) {
            console.info( `Writing release name '${releaseName}' to '${releaseFile}'...` );
            fs.writeFile( releaseFile, releaseName, err => {
                if( err ) {
                    reject( err );
                } else {
                    resolve();
                }
            } );
        } else {
            console.info( `Not writing release file (use "--releasefile" or "-f" to do so)` );
            resolve();
        }
    } );
}

// program backbone
Promise.resolve( readPackageRelease() )
       .then( packageRelease => Object.assign( {}, { packageRelease } ) )
       .then( ctx => Object.assign( {}, ctx, { args: parseCommandLineArgs() } ) )
       .then( printConfiguration )
       .then( ctx => Object.assign( {}, ctx, { gh: createGitHubClient( ctx.args.token ) } ) )
       .then( ctx => releases.findLastPublishedReleaseAndBaseCommit( ctx.gh, ctx.args.repo )
                             .then( res => Object.assign( {}, ctx, res ) ) )
       .then( ctx => commits.collectCommitsFromBaseToHead( ctx.gh, ctx.args.repo, ctx.base, ctx.args.commit )
                            .then( commits => Object.assign( {}, ctx, { commits } ) ) )
       .then( ctx => Object.assign( {}, ctx, { changeLog: commits.generateChangeLog( ctx.commits ) } ) )
       .then( ctx => releases.findOrCreateDraftRelease( ctx.gh,
                                                        ctx.args.repo,
                                                        ctx.lastPublishedRelease,
                                                        ctx.args.commit,
                                                        ctx.changeLog )
                             .then( draftRelease => Object.assign( {}, ctx, { draftRelease } ) ) )
       .then( ctx => writeReleaseFile( ctx.args.releasefile, ctx.draftRelease.name ).then( () => ctx ) )
       .then( ctx => {
           if( ctx.args.publish ) {
               return releases.publishRelease( ctx.gh, ctx.args.repo, ctx.draftRelease ).then( () => ctx );
           } else {
               return ctx;
           }
       } )
       .then( ctx => {
           ctx.args.verbose && console.info( "Done." );
           process.exit( 0 );
       } )
       .catch( err => {
           console.error( `ERROR! `, err );
           process.exit( 1 );
       } );
