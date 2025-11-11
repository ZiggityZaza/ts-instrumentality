import { describe, it, expect, vi } from 'vitest'
import * as n from '../src/node'
import * as fs from 'node:fs'
import * as ph from 'node:path'
import * as os from 'node:os'




const createTempRoot = () => fs.mkdtempSync(ph.join(os.tmpdir(), 'node-tests-'))
const removeTempRoot = (root: string) => {
  if (fs.existsSync(root)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

describe('to_RoadT', () => {
  it('determines entry types from the filesystem', () => {
    const root = createTempRoot()
    try {
      const filePath = ph.join(root, 'file.txt')
      const dirPath = ph.join(root, 'dir')
      const linkPath = ph.join(root, 'link')
      fs.writeFileSync(filePath, 'data')
      fs.mkdirSync(dirPath)
      let symlinkCreated = true
      try {
        fs.symlinkSync(filePath, linkPath)
      } catch {
        symlinkCreated = false
      }
      expect(n.to_RoadT(filePath)).toBe(n.RoadT.FILE)
      expect(n.to_RoadT(dirPath)).toBe(n.RoadT.FOLDER)
      if (symlinkCreated) {
        expect(n.to_RoadT(linkPath)).toBe(n.RoadT.SYMLINK)
        fs.unlinkSync(linkPath)
      }
      expect(() => n.to_RoadT(0)).toThrow(n.RoadTErr)
    } finally {
      removeTempRoot(root)
    }
  })
})

describe('road_factory', () => {
  it('creates Road subclasses matching entry types', () => {
    const root = createTempRoot()
    try {
      const filePath = ph.join(root, 'file.txt')
      const dirPath = ph.join(root, 'dir')
      fs.writeFileSync(filePath, '')
      fs.mkdirSync(dirPath)
      const fileRoad = n.road_factory(filePath)
      const folderRoad = n.road_factory(dirPath)
      expect(fileRoad).toBeInstanceOf(n.File)
      expect(fileRoad.type()).toBe(n.RoadT.FILE)
      expect(folderRoad).toBeInstanceOf(n.Folder)
      expect(folderRoad.type()).toBe(n.RoadT.FOLDER)
    } finally {
      removeTempRoot(root)
    }
  })
})

describe('File', () => {
  it('handles text, binary, metadata, rename, move, copy, and delete operations', () => {
    const root = createTempRoot()
    try {
      const filePath = ph.join(root, 'file.txt')
      const file = new n.File(filePath, true)
      file.edit_text('hello')
      expect(file.read_text()).toBe('hello')
      file.append_text(' world')
      expect(file.read_text()).toBe('hello world')
      file.edit_json({ foo: 'bar' })
      expect(file.read_json()).toEqual({ foo: 'bar' })
      const buffer = file.read_binary()
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(file.read_binary('utf-8')).toContain('"foo"')
      expect(file.ext()).toBe('.txt')
      expect(file.size_in_bytes()).toBeGreaterThan(0)
      file.rename_self_to('renamed.txt')
      expect(file.name()).toBe('renamed.txt')
      const copyFolder = new n.Folder(ph.join(root, 'copy'), true)
      const copied = file.copy_self_into(copyFolder)
      expect(copied.read_json()).toEqual({ foo: 'bar' })
      const moveFolder = new n.Folder(ph.join(root, 'moved'), true)
      file.move_self_into(moveFolder)
      expect(file.parent().isAt).toBe(moveFolder.isAt)
      expect(file.valid()).toBe(true)
      file.delete_self()
      expect(file.exists()).toBe(false)
      expect(file.valid()).toBe(false)
      copied.delete_self()
    } finally {
      removeTempRoot(root)
    }
  })

  it('throws when instantiated with a mismatched type', () => {
    const root = createTempRoot()
    try {
      const dirPath = ph.join(root, 'dir')
      fs.mkdirSync(dirPath)
      expect(() => new n.File(dirPath)).toThrow(n.RoadErr)
    } finally {
      removeTempRoot(root)
    }
  })
})

describe('Folder', () => {
  it('lists, finds, copies, moves, and deletes directories', () => {
    const root = createTempRoot()
    try {
      const sourcePath = ph.join(root, 'source')
      const innerPath = ph.join(sourcePath, 'inner')
      fs.mkdirSync(innerPath, { recursive: true })
      fs.writeFileSync(ph.join(sourcePath, 'a.txt'), 'data')
      const folder = new n.Folder(sourcePath)
      const entries = folder.list().map(entry => entry.name()).sort()
      expect(entries).toEqual(['a.txt', 'inner'])
      expect(folder.find('a.txt')).toBeInstanceOf(n.File)
      expect(folder.find('missing.txt')).toBeUndefined()
      expect(() => folder.find('')).toThrow(n.RoadErr)
      const innerFolder = new n.Folder(innerPath)
      expect(innerFolder.parent().isAt).toBe(folder.isAt)
      expect(innerFolder.parents().some(p => p.isAt === folder.isAt)).toBe(true)
      const copyDest = new n.Folder(ph.join(root, 'dest'), true)
      const copied = folder.copy_self_into(copyDest)
      expect(fs.existsSync(ph.join(copyDest.isAt, 'source', 'a.txt'))).toBe(true)
      const moveDest = new n.Folder(ph.join(root, 'move'), true)
      folder.move_self_into(moveDest)
      expect(folder.isAt).toBe(ph.join(moveDest.isAt, 'source'))
      folder.delete_self()
      expect(folder.exists()).toBe(false)
      copied.delete_self()
    } finally {
      removeTempRoot(root)
    }
  })
})

describe('SymbolicLink', () => {
  it('manages symbolic links when supported by the platform', () => {
    const root = createTempRoot()
    try {
      const targetPath = ph.join(root, 'target.txt')
      fs.writeFileSync(targetPath, 'target')
      const targetFile = new n.File(targetPath)
      const linkPath = ph.join(root, 'link.txt')
      let link: n.SymbolicLink | undefined
      try {
        link = new n.SymbolicLink(linkPath, targetFile)
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code
        if (code === 'EPERM' || code === 'EACCES' || code === 'ENOSYS') {
          return
        }
        throw error
      }
      if (!link) {
        return
      }
      expect(link.target()).toBeInstanceOf(n.File)
      const copyDest = new n.Folder(ph.join(root, 'dest'), true)
      const copied = link.copy_self_into(copyDest)
      expect(fs.readlinkSync(copied.isAt)).toBe(targetFile.isAt)
      const moveDest = new n.Folder(ph.join(root, 'move'), true)
      link.move_self_into(moveDest)
      expect(link.isAt).toBe(ph.join(moveDest.isAt, ph.basename(linkPath)))
      copied.delete_self()
      link.delete_self()
    } finally {
      removeTempRoot(root)
    }
  })
})

describe('Temporary entries', () => {
  it('cleans up TempFile on dispose', () => {
    const tempFile = new n.TempFile()
    const tempPath = tempFile.isAt
    expect(fs.existsSync(tempPath)).toBe(true)
    tempFile[Symbol.dispose]()
    expect(fs.existsSync(tempPath)).toBe(false)
  })

  it('cleans up TempFolder on dispose', () => {
    const tempFolder = new n.TempFolder()
    const tempPath = tempFolder.isAt
    fs.writeFileSync(ph.join(tempPath, 'nested.txt'), 'nested')
    expect(fs.existsSync(tempPath)).toBe(true)
    tempFolder[Symbol.dispose]()
    expect(fs.existsSync(tempPath)).toBe(false)
  })
})
