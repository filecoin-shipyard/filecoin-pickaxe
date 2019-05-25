import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { homedir } from 'os'
import PeerBase from 'peer-base'
import IPFSRepo from 'ipfs-repo'
import multihash from 'multihashes'

export class Mineshaft {
  constructor (repoName) {
    assert(!!repoName)
    this.repoPath = path.resolve(homedir(), '.' + repoName)
    const repo = new IPFSRepo(this.repoPath)
    const appName = 'peer-pad/2' // Re-use pinning infrastructure set up for PeerPad
    this.app = PeerBase(appName, {
      ipfs: {
        repo,
        swarm: ['/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star'],
        bootstrap: [
          '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
          '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
          '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
          '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
          '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
          '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
          '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
          '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
        ]
      }
    })
  }

  async start () {
    const configFile = path.join(this.repoPath, 'pickaxe-config')
    if (fs.existsSync(configFile)) {
      const config = fs.readFileSync(configFile, 'utf8')
      const { readKey, writeKey } = JSON.parse(config)
      this.keys = await PeerBase.keys.uriDecode(readKey + '-' + writeKey)
    } else {
      this.keys = await PeerBase.keys.generate()
      const readKey = PeerBase.keys.uriEncodeReadOnly(this.keys)
      const writeKey = PeerBase.keys.uriEncode(this.keys).replace(/^.*-/, '')
      const confit = { readKey, writeKey }
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
    }

    const data = Buffer.concat([
      Buffer.from('pickaxe'),
      this.keys.read.marshal()
    ])
    const hashed = multihash.encode(data, 'sha2-256')
    const hashedName = multihash.toB58String(hashed)
    const name = 'pickaxe-dev'
    await this.app.start()
    const options = {
      keys: this.keys
    }
    this.collaboration = await this.app.collaborate(hashedName, 'rga', options)
  }

  async stop () {
    await this.collaboration.stop()
    await this.app.stop()
  }

  async bundleImports () {
    return await this.collaboration.sub('bundleImports', 'ormap')
  }
}

let mineshaft // Singleton

export async function mineshaftStart (repoName) {
  mineshaft = new Mineshaft(repoName)
  await mineshaft.start()
  return mineshaft
}

export function getMineshaft () {
  return mineshaft
}

export async function mineshaftStop () {
  await mineshaft.stop()
}
