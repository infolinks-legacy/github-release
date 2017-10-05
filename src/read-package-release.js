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
            fs.readFile( packageReleaseFile, ( err, data ) => {
                if( err ) {
                    reject( err );
                } else {
                    resolve( { packageRelease: data } );
                }
            } );
        } else {
            resolve( { packageRelease: "local" } );
        }
    } ) );
}

exports = readPackageReleaseAsPromise;
