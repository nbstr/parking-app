#!/bin/bash
# build.sh

_dfiles="/Users/ulyssecoates/Projects/parking-app/*"
_afiles="/Users/ulyssecoates/Projects/pkapp/www"

cp -vR $_dfiles $_afiles

cd "/Users/ulyssecoates/Projects/pkapp"

cordova run

cd -