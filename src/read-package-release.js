const fs = require( "fs" );

// file containing our this package's release number
const packageReleaseFile = "/usr/local/lib/github-release/release";

/**
 * Returns a promise which resolves to this package's release.
 * @return {Promise}
 */
function readPackageReleaseAsPromise() {
    return new Promise( ( resolve, reject ) => fs.exists( packageReleaseFile, exists => {
        if( exists ) {
            fs.readFile( packageReleaseFile, ( err, packageRelease ) => {
                if( err ) {
                    reject( err );
                } else if( !packageRelease ) {
                    resolve( "local" );
                } else {
                    resolve( (packageRelease + "").trim() );
                }
            } );
        } else {
            resolve( "local" );
        }
    } ) );
}

module.exports = readPackageReleaseAsPromise;
