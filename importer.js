const sharp = require('sharp')
const ipfsAPI = require('ipfs-http-client')
const path = require('path')
const fs = require('fs')
const uuid = require('uuid')

// CONFIG
const galleryPath = "./albums"
const mfsBasePath = "/gallery"

// Initialise stuff
const ipfs = ipfsAPI()
const ipfsCfg = {
	create: true,
	parents: true,
}

// Functions
const importDir = (parent, dir = null, albumId = null) => {
	return new Promise(async (resolve, reject) => {
		let current = dir ? path.join(parent, dir) : parent
		let items = []

		const files = fs.readdirSync(current)

		for (let i = 0; i < files.length; i++) {
			if (dir) {
				process.stdout.cursorTo(0)
				process.stdout.write(`${dir} ${i}/${files.length}`)
			}
			const f = files[i]
			const lstat = fs.lstatSync(path.join(current, f))

			if (lstat.isDirectory()) {
				let id = uuid.v4()
				let albumItems = await importDir(current, f, id)
				items = [
					...items,
					{
						...{
							src: "",
							kind: "album",
							title: f,
							ID: id,
						}, ...(albumId ? {
							albumID: albumId,
						} : {}), ...(albumItems.length > 0 ? {
							src: albumItems[0].tsrc,
						} : {}),
					},
					...albumItems,
				]
			} else {
				let img = sharp(path.join(current, f))
				const name = f.substr(0, f.lastIndexOf('.'))
				const thumb = `${name}_t.` + f.substr(f.lastIndexOf('.') + 1)
				await ipfs.files.write(`${mfsBasePath}/albums/${dir}/${f}`, await img.toBuffer(), ipfsCfg)
				await ipfs.files.write(`${mfsBasePath}/albums/${dir}/${thumb}`, await img.resize({height: 250}).toBuffer(), ipfsCfg)

				items.push({
					src: `${dir}/${f}`,
					tsrc: `${dir}/${thumb}`,
					albumID: albumId,
					title: name,
				})
			}
		}

		if (dir) {
			process.stdout.cursorTo(0)
			console.log(`Imported ${dir}`)
		}
		resolve(items)
	})
}

const rawImport = async (baseDir, subDir = null) => {
	const dir = subDir ? path.join(baseDir, subDir) : baseDir
	const files = fs.readdirSync(dir)
	for(let f of files) {
		const lstat = fs.lstatSync(path.join(dir, f))
		if (lstat.isDirectory()) {
			await rawImport(baseDir, subDir ? path.join(subDir, f) : f)
		} else {
			const content = fs.readFileSync(path.join(dir, f))
			await ipfs.files.write((subDir ? path.join(mfsBasePath, subDir, f) : path.join(mfsBasePath, f)).replace(/\\/g, '/'), content, ipfsCfg)
		}
	}
}

const ensureAndGetExisting = () => new Promise((resolve, reject) => {
	ipfs.files.stat(`${mfsBasePath}/items.json`).then(async (r) => {
		const chunks = []

		for await (const chunk of ipfs.files.read(`${mfsBasePath}/items.json`)) {
		  chunks.push(chunk)
		}
		resolve(JSON.parse(Buffer.concat(chunks).toString()))
	}).catch(async (e) => {
		console.log(e)
		reject()
		return;
		const initDir = './init'
		console.log('Initializing...')
		await rawImport(initDir)
		console.log('Initialized')
		resolve([])
	})
})

// Actually launch the whole thing
ensureAndGetExisting().then(base => {
	importDir(galleryPath).then(r => {
		console.log("Updating json...")
		ipfs.files.write(`${mfsBasePath}/items.json`, JSON.stringify([...base, ...r]), ipfsCfg)
		console.log("Done!")
	})
})
