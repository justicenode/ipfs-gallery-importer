# About
This is a small importer script to import albums into ipfs wrapped with a neat gui from [nanogallery2](https://nanogallery2.nanostudio.org/).

# Usage
1. create `./albums` add albums to it
2. run `npm install` or `yarn` to install dependencies
3. run `node importer.js` to import all files

to add new albums just add them (and only them) to `./albums` and run `node importer.js` again

# Caveats
- Having non jpeg or png files in the albums will cause a crash
