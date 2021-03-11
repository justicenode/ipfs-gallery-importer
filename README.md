# About
This is a small importer script to import albums into ipfs wrapped with a neat gui from [nanogallery2](https://nanogallery2.nanostudio.org/).

If you want to know what to expect, heres an [example](https://ipfs.io/ipfs/QmfPHNRJrPmJfiWtUSxYny61a9vYpmnA6CmDkuc1gQH2E9/).

# Usage
1. create `./albums` and add albums to it
2. run `npm install` or `yarn` to install dependencies
3. run `node importer.js` to import all files

to add new albums just add them (and only them) to `./albums` and run `node importer.js` again.

# Notes
- The gallery can be customized in the `index.html` as it wont be replaced by updates.
- Having non jpeg or png files in the albums will cause a crash!
- Multi level albums dont work as nanogallery2 doesnt support that (AFAIK). This script will still import them though.
