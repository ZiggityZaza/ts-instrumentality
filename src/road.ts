import * as rl from "node:readline"
import * as fs from "node:fs"
import * as fp from "node:fs/promises"
import * as ph from "node:path"
import * as os from "node:os"
import { on } from "node:events"




// Type management
/**
 * Union type of all standard filesystem node constructors.
 * 
 * @see {@link File}, {@link Folder}, {@link BlockDevice}, {@link CharacterDevice}, {@link SymbolicLink}, {@link Fifo}, {@link Socket}
 */
export type road_t =
  typeof File |
  typeof Folder |
  typeof BlockDevice |
  typeof CharacterDevice |
  typeof SymbolicLink |
  typeof Fifo |
  typeof Socket

/**
 * Determines the filesystem node type from a path or mode value.
 * 
 * @param _pathorMode - File path (string) or mode bits (number)
 * @returns The corresponding {@link road_t} constructor
 * @throws If the mode doesn't match any known filesystem type
 * 
 * @example
 * ```ts
 * const type = roadType('/path/to/file.txt') // File
 * const type = roadType(fs.lstatSync('/path').mode) // Folder or File
 * ```
 */
export function roadType(_pathorMode: string | number): road_t {
  const mode = typeof _pathorMode === 'string' ? fs.lstatSync(_pathorMode).mode : _pathorMode
  switch (mode & fs.constants.S_IFMT) {
    case fs.constants.S_IFREG: return File
    case fs.constants.S_IFDIR: return Folder
    case fs.constants.S_IFBLK: return BlockDevice
    case fs.constants.S_IFCHR: return CharacterDevice
    case fs.constants.S_IFLNK: return SymbolicLink
    case fs.constants.S_IFIFO: return Fifo
    case fs.constants.S_IFSOCK: return Socket
    default: throw new Error(`Unknown mode type ${mode} for path/mode: '${_pathorMode}'`)
  }
}



/**
 * Base class for all filesystem nodes (files, folders, links, devices).
 * 
 * Provides common functionality for querying and monitoring filesystem entries.
 * Subclasses must implement positional operations (delete, move, copy, rename).
 * 
 * @example
 * ```ts
 * const node = Road.factory_sync('/path/to/entry')
 * console.log(node.name()) // 'entry'
 * console.log(node.depth()) // depth in filesystem
 * 
 * const isAccessible = await node.accessible()
 * await node.until_accessible()
 * ```
 * 
 * @throws Constructor throws if path doesn't exist or type mismatch occurs
 * 
 * @see {@link File}, {@link Folder}, {@link SymbolicLink} for concrete implementations
 */
export abstract class Road {
  /**
   * The filesystem path this node points to.
   * @internal
   */
  protected pointsTo: string
  /**
   * Gets the full filesystem path.
   */
  get isAt(): string { return this.pointsTo }
  /**
   * Whether this node can be modified.
   * 
   * This is an internal flag, not actual filesystem permissions.
   * Set to `false` to prevent modifications even if OS allows it.
   * 
   * @default true
   */
  mutable: boolean = true

  /**
   * Creates a Road instance for the given path.
   * 
   * Verifies path exists and is of the constructed type.
   * 
   * @param _lookFor - Filesystem path to verify and use
   * @throws If path doesn't exist or type doesn't match constructor
   */
  constructor(_lookFor: string) {
    fs.accessSync(_lookFor, fs.constants.F_OK)
    this.pointsTo = ph.resolve(_lookFor)
    if (!(this instanceof roadType(this.isAt)))
      throw new Error(`Type missmatch: Path '${this.isAt}' is not of constructed type ${this.constructor.name}`)
  }

  /**
   * Creates a Road subclass instance for the given path.
   * 
   * @param _lookFor - Path to analyze and wrap
   * @returns Promise resolving to appropriate {@link Road} subclass (File, Folder, etc.)
   * @throws If path doesn't exist
   * 
   * @example
   * ```ts
   * const node = await Road.factory('/path/to/something')
   * // node is File, Folder, SymbolicLink, etc. based on actual type
   * ```
   */
  static async factory(_lookFor: string): Promise<Road> {
    await fp.access(_lookFor, fs.constants.F_OK)
    const roadCtor = roadType(_lookFor)
    return new roadCtor(_lookFor)
  }
  /**
   * Synchronous version of {@link factory}.
   */
  static factory_sync(_lookFor: string): Road {
    fs.accessSync(_lookFor, fs.constants.F_OK)
    const roadCtor = roadType(_lookFor)
    return new roadCtor(_lookFor)
  }

  // Query methods
  /**
   * Asserts this node is mutable.
   * 
   * @throws If node is marked immutable
   */
  assert_mutable(): void {
    if (!this.mutable)
      throw new Error(`Mutability assertion failed: '${this.isAt}' is marked as immutable (regardless of OS permissions)`)
  }
  /**
   * Checks if path exists and matches expected type.
   */
  exists_sync(): boolean {
    return fs.existsSync(this.isAt) && (this instanceof roadType(this.isAt))
  }
  /**
   * Async version of {@link exists_sync}.
   */
  async exists(): Promise<boolean> {
    try {
      await fp.access(this.isAt, fs.constants.F_OK)
      return this instanceof roadType(this.isAt)
    } catch {
      return false
    }
  }
  /**
   * Gets filesystem stats for this node.
   */
  stats_sync(): fs.Stats {
    return fs.lstatSync(this.isAt)
  }
  /**
   * Async version of {@link stats_sync}.
   */
  async stats(): Promise<fs.Stats> {
    return fp.lstat(this.isAt)
  }
  /**
   * Returns depth in filesystem hierarchy (number of separators).
   * 
   * @example
   * ```ts
   * // For '/a/b/c/file.txt':
   * node.depth() // 3
   * ```
   */
  depth(): number {
    return this.isAt.split(ph.sep).length - 1
  }
  /**
   * Returns the parent folder.
   */
  parent(): Folder {
    return new Folder(ph.dirname(this.isAt))
  }
  /**
   * Returns all ancestor folders up to filesystem root.
   * 
   * @example
   * ```ts
   * // For '/a/b/c/file.txt':
   * node.ancestors() // [Folder('/a/b/c'), Folder('/a/b'), Folder('/a')]
   * ```
   */
  ancestors(): Folder[] {
    const result: Folder[] = []
    let current: Folder = this.parent()
    while (current.isAt !== current.parent().isAt) {
      result.push(current)
      current = current.parent()
    }
    return result
  }
  /**
   * Returns the basename of this path.
   */
  name(): string {
    return ph.basename(this.isAt)
  }
  /**
   * Joins path segments to this path.
   * 
   * @param _paths - Path segments to join
   * @returns The resulting full path
   */
  join(..._paths: string[]): string {
    return ph.join(this.isAt, ..._paths)
  }

  // Access methods
  /**
   * Checks if this path is accessible with given mode.
   * 
   * @param _mode - Access mode to check (default: `F_OK` - existence)
   * @returns true if accessible, false if not found or denied
   * 
   * @example
   * ```ts
   * const readable = await node.accessible(fs.constants.R_OK)
   * const writable = await node.accessible(fs.constants.W_OK)
   * ```
   */
  accessible_sync(_mode: number = fs.constants.F_OK): boolean {
    try {
      fs.accessSync(this.isAt, _mode)
      return true
    } catch (e) {
      const err = e as NodeJS.ErrnoException
      if (err?.code === 'ENOENT' || err?.code === 'EACCES')
        return false
      throw e
    }
  }
  /**
   * Async version of {@link accessible_sync}.
   */
  async accessible(_mode: number = fs.constants.F_OK): Promise<boolean> {
    try {
      await fp.access(this.isAt, _mode)
      return true
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException
      if (err?.code === 'ENOENT' || err?.code === 'EACCES')
        return false
      throw e
    }
  }
  /**
   * Waits until this path becomes accessible.
   * 
   * Polls the filesystem and rehecks after change events.
   * Can be aborted via signal.
   * 
   * @param _mode - Access mode to wait for (default: `F_OK`)
   * @param _abortSignal - Signal to abort waiting
   * @param _onEachAttempt - Optional callback after each check
   * 
   * @example
   * ```ts
   * const ac = new AbortController()
   * setTimeout(() => ac.abort(), 5000) // timeout after 5s
   * 
   * await node.until_accessible(fs.constants.R_OK, ac.signal, 
   *   () => console.log('Still waiting...'))
   * ```
   */
  async until_accessible(_mode: number = fs.constants.F_OK, _abortSignal: AbortSignal, _onEachAttempt?: () => unknown): Promise<void> {
    const watcher = fs.watch(this.isAt)
    try {
      if (await this.accessible(_mode))
        return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of on(watcher, 'change', { signal: _abortSignal }))
        if (await this.accessible(_mode))
          return
        else
          await _onEachAttempt?.()
    } finally {
      watcher.close()
    }
  }
  /**
   * Watches for changes to this path.
   * 
   * Executes callback on each change event. Can be aborted via signal.
   * 
   * @param _abortSignal - Signal to stop watching
   * @param _thenDo - Optional callback on each change
   * 
   * @example
   * ```ts
   * const ac = new AbortController()
   * 
   * const task = node.on_change(ac.signal, 
   *   () => console.log('File changed!'))
   * 
   * setTimeout(() => ac.abort(), 30000) // stop watching after 30s
   * await task
   * ```
   */
  async on_change(_abortSignal: AbortSignal, _thenDo?: () => unknown): Promise<void> {
    const watcher = fs.watch(this.isAt)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of on(watcher, 'change', { signal: _abortSignal }))
        await _thenDo?.()
    } finally {
      watcher.close()
    }
  }

  // Abstract methods - implement in subclasses
  abstract delete_sync(): void
  abstract delete(): Promise<void>
  abstract move_sync(_into: Folder): void
  abstract move(_into: Folder): Promise<void>
  abstract copy_sync(_into: Folder): this
  abstract copy(_into: Folder): Promise<this>
  abstract rename_sync(_to: string): void
  abstract rename(_to: string): Promise<void>
}



/**
 * Represents a regular file.
 * 
 * Provides methods for reading/writing content (text and binary),
 * streaming, and file manipulation (move, copy, rename, delete).
 * 
 * @example
 * ```ts
 * const file = await File.create('/path/file.txt')
 * await file.write_text('Hello World')
 * const content = await file.read_text()
 * 
 * // Stream API
 * for await (const line of file.it_lines()) {
 *   console.log(line)
 * }
 * 
 * // Move to another folder
 * await file.move(destinationFolder)
 * ```
 * 
 * @see {@link Road} for common operations like exists, parent, name
 */
export class File extends Road {
  /**
   * Creates a file at the given path.
   * 
   * Creates empty file if it doesn't exist, otherwise opens existing file.
   * 
   * @param _at - Path where file should be created
   * @returns Promise resolving to File instance
   * 
   * @example
   * ```ts
   * const file = await File.create('/tmp/newfile.txt')
   * ```
   */
  static async create(_at: string): Promise<File> {
    try {
      await fp.access(_at, fs.constants.F_OK)
    } catch {
      await fp.writeFile(_at, "")
    }
    return new File(_at)
  }
  /**
   * Synchronous version of {@link create}.
   */
  static create_sync(_at: string): File {
    try {
      fs.accessSync(_at, fs.constants.F_OK)
    } catch {
      fs.writeFileSync(_at, "")
    }
    return new File(_at)
  }

  // Text operations
  /**
   * Reads entire file as UTF-8 string.
   * 
   * @throws If file cannot be read
   * @example
   * ```ts
   * const text = file.read_text_sync()
   * ```
   */
  read_text_sync(): string {
    return fs.readFileSync(this.isAt, { encoding: "utf-8" })
  }
  /**
   * Async version of {@link read_text_sync}.
   */
  async read_text(): Promise<string> {
    return fp.readFile(this.isAt, { encoding: "utf-8" })
  }
  /**
   * Iterates file line by line.
   * 
   * @example
   * ```ts
   * for await (const line of file.it_lines()) {
   *   console.log(line)
   * }
   * ```
   */
  async *it_lines(): AsyncIterableIterator<string> {
    for await (const line of rl.createInterface({ input: fs.createReadStream(this.isAt, { encoding: "utf-8" }), crlfDelay: Infinity }))
      yield line
  }
  /**
   * Overwrites file with text.
   * 
   * @param _content - Text to write (UTF-8 encoded)
   * @throws If file is immutable or write fails
   * @example
   * ```ts
   * file.write_text_sync('New content')
   * ```
   */
  write_text_sync(_content: string): void {
    this.assert_mutable()
    fs.writeFileSync(this.isAt, _content, { encoding: "utf-8" })
  }
  /**
   * Async version of {@link write_text_sync}.
   */
  async write_text(_content: string): Promise<void> {
    this.assert_mutable()
    return fp.writeFile(this.isAt, _content, { encoding: "utf-8" })
  }
  /**
   * Appends text to end of file.
   * 
   * @param _content - Text to append (UTF-8 encoded)
   * @throws If file is immutable or write fails
   * @example
   * ```ts
   * file.append_text_sync('\nAppended line')
   * ```
   */
  append_text_sync(_content: string): void {
    this.assert_mutable()
    fs.appendFileSync(this.isAt, _content, { encoding: "utf-8" })
  }
  /**
   * Async version of {@link append_text_sync}.
   */
  async append_text(_content: string): Promise<void> {
    this.assert_mutable()
    return fp.appendFile(this.isAt, _content, { encoding: "utf-8" })
  }

  // Binary operations
  /**
   * Reads entire file as Buffer.
   * 
   * @throws If file cannot be read
   */
  read_bytes_sync(): Buffer {
    return fs.readFileSync(this.isAt)
  }
  /**
   * Async version of {@link read_bytes_sync}.
   */
  async read_bytes(): Promise<Buffer> {
    return fp.readFile(this.isAt)
  }
  /**
   * Iterates file in fixed-size chunks.
   * 
   * Useful for processing large files without loading into memory.
   * 
   * @param _chunkSize - Bytes per chunk (default: 1024)
   * @example
   * ```ts
   * for (const chunk of file.it_bytes_sync(4096))
   *   process(chunk) // Handle each chunk
   * ```
   */
  *it_bytes_sync(_chunkSize: number = 1024): IterableIterator<Buffer> {
    const fd = fs.openSync(this.isAt, 'r')
    const buffer = Buffer.alloc(_chunkSize)
    let bytesRead: number
    try {
      do {
        bytesRead = fs.readSync(fd, buffer, 0, _chunkSize, null)
        if (bytesRead > 0)
          yield buffer.subarray(0, bytesRead)
      } while (bytesRead === _chunkSize)
    } finally {
      fs.closeSync(fd)
    }
  }
  /**
   * Async version of {@link it_bytes_sync}.
   * 
   * @param _chunkSize - Bytes per chunk (default: 1024)
   */
  async *it_bytes(_chunkSize: number = 1024): AsyncIterableIterator<Buffer> {
    const fd = await fp.open(this.isAt, 'r')
    const buffer = Buffer.alloc(_chunkSize)
    let bytesRead: number
    try {
      do {
        const readResult = await fd.read(buffer, 0, _chunkSize, null)
        bytesRead = readResult.bytesRead
        if (bytesRead > 0)
          yield buffer.subarray(0, bytesRead)
      } while (bytesRead === _chunkSize)
    } finally {
      await fd.close()
    }
  }
  /**
   * Overwrites file with binary data.
   * 
   * @param _content - Data to write as Buffer
   * @throws If file is immutable or write fails
   */
  write_bytes_sync(_content: Buffer): void {
    this.assert_mutable()
    fs.writeFileSync(this.isAt, _content)
  }
  /**
   * Async version of {@link write_bytes_sync}.
   */
  async write_bytes(_content: Buffer): Promise<void> {
    this.assert_mutable()
    return fp.writeFile(this.isAt, _content)
  }
  /**
   * Appends binary data to end of file.
   * 
   * @param _content - Data to append as Buffer
   * @throws If file is immutable or write fails
   */
  append_bytes_sync(_content: Buffer): void {
    this.assert_mutable()
    fs.appendFileSync(this.isAt, _content)
  }
  /**
   * Async version of {@link append_bytes_sync}.
   */
  async append_bytes(_content: Buffer): Promise<void> {
    this.assert_mutable()
    return fp.appendFile(this.isAt, _content)
  }

  // Streaming
  /**
   * Creates a readable stream for this file.
   * 
   * @example
   * ```ts
   * file.create_read_stream()
   *   .pipe(transform)
   *   .pipe(destination)
   * ```
   */
  create_read_stream(): fs.ReadStream {
    return fs.createReadStream(this.isAt)
  }
  /**
   * Creates a writable stream for this file.
   * 
   * @throws If file is immutable
   */
  create_write_stream(): fs.WriteStream {
    this.assert_mutable()
    return fs.createWriteStream(this.isAt)
  }

  // Comparison
  /**
   * Checks if this file has identical content to another file.
   * 
   * @param _other - File to compare with
   * @returns true if contents are byte-for-byte identical
   */
  async same_as(_other: File): Promise<boolean> {
    if (this.isAt !== _other.isAt)
      return false
    const thisBuffer = await fp.readFile(this.isAt)
    const otherBuffer = await fp.readFile(_other.isAt)
    return thisBuffer.equals(otherBuffer)
  }
  /**
   * Synchronous version of {@link same_as}.
   */
  same_as_sync(_other: File): boolean {
    if (this.isAt !== _other.isAt)
      return false
    const thisBuffer = fs.readFileSync(this.isAt)
    const otherBuffer = fs.readFileSync(_other.isAt)
    return thisBuffer.equals(otherBuffer)
  }

  // Properties
  /**
   * Gets the file extension including dot (e.g., ".txt").
   */
  ext(): string {
    return ph.extname(this.isAt)
  }

  // Abstract methods implementation
  /**
   * Synchronously deletes this file.
   * 
   * @throws If file is immutable or deletion fails
   */
  delete_sync(): void {
    this.assert_mutable()
    fs.unlinkSync(this.isAt)
  }
  /**
   * Async version of {@link delete_sync}.
   */
  async delete(): Promise<void> {
    this.assert_mutable()
    return fp.unlink(this.isAt)
  }
  /**
   * Moves this file into a folder.
   * 
   * @param _into - Destination folder
   * @throws If file is immutable
   */
  move_sync(_into: Folder): void {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link move_sync}.
   */
  async move(_into: Folder): Promise<void> {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Copies this file into a folder.
   * 
   * @param _into - Destination folder
   * @returns New File instance at the copy location
   */
  copy_sync(_into: Folder): this {
    const newPath = _into.join(this.name())
    fs.copyFileSync(this.isAt, newPath)
    return new File(newPath) as this
  }
  /**
   * Async version of {@link copy_sync}.
   */
  async copy(_into: Folder): Promise<this> {
    const newPath = _into.join(this.name())
    await fp.copyFile(this.isAt, newPath)
    return new File(newPath) as this
  }
  /**
   * Renames this file.
   * 
   * @param _to - New name or relative path
   * @throws If file is immutable
   */
  rename_sync(_to: string): void {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link rename_sync}.
   */
  async rename(_to: string): Promise<void> {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
}



/**
 * Represents a directory/folder.
 * 
 * Provides methods for listing entries, finding files, and directory manipulation.
 * 
 * @example
 * ```ts
 * const dir = await Folder.create('/tmp/mydir')
 * 
 * // List all entries
 * const allEntries = await dir.list()
 * const onlyFiles = await dir.list(File)
 * 
 * // Find specific entry
 * const file = await dir.find('readme.txt', File)
 * 
 * // Traverse
 * for (const ancestor of dir.ancestors())
 *   console.log(ancestor.name())
 * ```
 * 
 * @see {@link Road} for common operations
 */
export class Folder extends Road {
  /**
   * Creates a folder at the given path.
   * 
   * Creates recursively if needed. Opens existing folder if it exists.
   * 
   * @param _at - Path where folder should be created
   * @returns Promise resolving to Folder instance
   */
  static async create(_at: string): Promise<Folder> {
    try {
      await fp.access(_at, fs.constants.F_OK)
    } catch {
      await fp.mkdir(_at, { recursive: true })
    }
    return new Folder(_at)
  }
  /**
   * Synchronous version of {@link create}.
   */
  static create_sync(_at: string): Folder {
    try {
      fs.accessSync(_at, fs.constants.F_OK)
    } catch {
      fs.mkdirSync(_at, { recursive: true })
    }
    return new Folder(_at)
  }

  // List operations
  /**
   * Lists all entries in this folder.
   * 
   * Can optionally filter by type (File, Folder, etc.).
   * 
   * @returns Array of Road instances
   * @example
   * ```ts
   * const all = folder.list_sync()
   * const files = folder.list_sync(File)
   * const dirs = folder.list_sync(Folder)
   * ```
   */
  list_sync(): Road[]
  list_sync<T extends Road>(expectedType: new (_: string) => T): T[]
  list_sync<T extends Road>(expectedType?: new (_: string) => T): Road[] | T[] {
    const entries = fs.readdirSync(this.isAt).map(entry => Road.factory_sync(this.join(entry)))
    if (!expectedType)
      return entries
    return entries.filter(entry => entry instanceof expectedType) as T[]
  }
  /**
   * Async version of {@link list_sync}.
   */
  async list(): Promise<Road[]>
  async list<T extends Road>(_expectedType: new (_: string) => T): Promise<T[]>
  async list<T extends Road>(_expectedType?: new (_: string) => T): Promise<Road[] | T[]> {
    const entries = (await fp.readdir(this.isAt)).map(async entry => Road.factory(this.join(entry)))
    const resolvedEntries = await Promise.all(entries)
    if (!_expectedType)
      return resolvedEntries
    return resolvedEntries.filter(entry => entry instanceof _expectedType) as T[]
  }

  // Find operations
  /**
   * Finds an entry by name in this folder.
   * 
   * Can optionally check type (File, Folder, etc.).
   * Returns null if not found or type doesn't match.
   * 
   * @param name - Entry name to find
   * @param _expectedType - Optional type filter
   * @returns Found entry or null
   * @example
   * ```ts
   * const file = folder.find_sync('config.json', File)
   * const subdir = folder.find_sync('src', Folder)
   * ```
   */
  find_sync(name: string): Road | null
  find_sync<T extends Road>(name: string, _expectedType: new (_: string) => T): T | null
  find_sync<T extends Road>(name: string, _expectedType?: new (_: string) => T): Road | T | null {
    try {
      fs.accessSync(this.join(name), fs.constants.F_OK)
      const found = Road.factory_sync(this.join(name))
      if (!_expectedType)
        return found
      if (found instanceof _expectedType)
        return found as T
      return null
    } catch {
      return null
    }
  }
  /**
   * Async version of {@link find_sync}.
   */
  async find(name: string): Promise<Road | null>
  async find<T extends Road>(name: string, _expectedType: new (_: string) => T): Promise<T | null>
  async find<T extends Road>(name: string, _expectedType?: new (_: string) => T): Promise<Road | T | null> {
    try {
      await fp.access(this.join(name), fs.constants.F_OK)
      const found = await Road.factory(this.join(name))
      if (!_expectedType)
        return found
      if (found instanceof _expectedType)
        return found as T
      return null
    } catch {
      return null
    }
  }

  // Abstract methods implementation
  /**
   * Synchronously deletes this folder and all contents.
   * 
   * @throws If folder is immutable or deletion fails
   */
  delete_sync(): void {
    this.assert_mutable()
    fs.rmdirSync(this.isAt, { recursive: true })
  }
  /**
   * Async version of {@link delete_sync}.
   */
  async delete(): Promise<void> {
    this.assert_mutable()
    return fp.rmdir(this.isAt, { recursive: true })
  }
  /**
   * Moves this folder into another folder.
   * 
   * @param _into - Destination folder
   * @throws If folder is immutable
   */
  move_sync(_into: Folder): void {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link move_sync}.
   */
  async move(_into: Folder): Promise<void> {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Copies this folder into another folder.
   * 
   * Recursively copies all contents.
   * 
   * @param _into - Destination folder
   * @returns New Folder instance at the copy location
   */
  copy_sync(_into: Folder): this {
    const newPath = _into.join(this.name())
    fs.cpSync(this.isAt, newPath, { recursive: true })
    return new Folder(newPath) as this
  }
  /**
   * Async version of {@link copy_sync}.
   */
  async copy(_into: Folder): Promise<this> {
    const newPath = _into.join(this.name())
    await fp.cp(this.isAt, newPath, { recursive: true })
    return new Folder(newPath) as this
  }
  /**
   * Renames this folder.
   * 
   * @param _to - New name or relative path
   * @throws If folder is immutable
   */
  rename_sync(_to: string): void {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link rename_sync}.
   */
  async rename(_to: string): Promise<void> {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
}



/**
 * Represents a symbolic link.
 * 
 * Provides methods for reading targets and retargeting links.
 * Symbolic links can be moved, copied, and renamed like regular files.
 * 
 * @example
 * ```ts
 * const link = await SymbolicLink.create('/path/link', targetRoad)
 * const target = await link.target()
 * await link.retarget(newTarget)
 * ```
 * 
 * @see {@link Road} for common operations like move, delete, rename
 */
export class SymbolicLink extends Road {
  /**
   * Creates a symbolic link at the given path.
   * 
   * Creates new link if it doesn't exist, opens existing link otherwise.
   * 
   * @param _at - Path where link should be created
   * @param _target - Optional target for the link
   * @returns Promise resolving to SymbolicLink instance
   */
  static async create(_at: string, _target?: Road): Promise<SymbolicLink> {
    try {
      await fp.access(_at, fs.constants.F_OK)
    } catch {
      await fp.symlink(_target?.isAt ?? "", _at)
    }
    return new SymbolicLink(_at)
  }
  /**
   * Synchronous version of {@link create}.
   */
  static create_sync(_at: string, _target?: Road): SymbolicLink {
    try {
      fs.accessSync(_at, fs.constants.F_OK)
    } catch {
      fs.symlinkSync(_target?.isAt ?? "", _at)
    }
    return new SymbolicLink(_at)
  }

  // Target operations
  /**
   * Gets the target of this link as a Road instance.
   * 
   * @returns Road instance pointing to link target
   * @throws If link target cannot be read
   */
  target_sync(): Road {
    return Road.factory_sync(ph.resolve(ph.dirname(this.isAt), fs.readlinkSync(this.isAt)))
  }
  /**
   * Async version of {@link target_sync}.
   */
  async target(): Promise<Road> {
    const linkPath = await fp.readlink(this.isAt)
    return Road.factory(ph.resolve(ph.dirname(this.isAt), linkPath))
  }
  /**
   * Changes what this link points to.
   * 
   * Deletes the old link and creates a new one.
   * 
   * @param _newTarget - New target Road
   * @throws If link is immutable or operation fails
   */
  retarget_sync(_newTarget: Road): void {
    this.assert_mutable()
    this.delete_sync()
    fs.symlinkSync(_newTarget.isAt, this.isAt)
  }
  /**
   * Async version of {@link retarget_sync}.
   */
  async retarget(_newTarget: Road): Promise<void> {
    this.assert_mutable()
    await this.delete()
    return fp.symlink(_newTarget.isAt, this.isAt)
  }

  // Abstract methods implementation
  /**
   * Synchronously deletes this symbolic link.
   * 
   * (Does not delete the target)
   * 
   * @throws If link is immutable or deletion fails
   */
  delete_sync(): void {
    this.assert_mutable()
    fs.unlinkSync(this.isAt)
  }
  /**
   * Async version of {@link delete_sync}.
   */
  async delete(): Promise<void> {
    this.assert_mutable()
    return fp.unlink(this.isAt)
  }
  /**
   * Moves this link into a folder.
   * 
   * @param _into - Destination folder
   * @throws If link is immutable
   */
  move_sync(_into: Folder): void {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link move_sync}.
   */
  async move(_into: Folder): Promise<void> {
    this.assert_mutable()
    const newPath = _into.join(this.name())
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Copies this link into a folder.
   * 
   * Creates a new link pointing to the same target.
   * 
   * @param _into - Destination folder
   * @returns New SymbolicLink instance at copy location
   */
  copy_sync(_into: Folder): this {
    const newPath = _into.join(this.name())
    const target = this.target_sync()
    fs.symlinkSync(target.isAt, newPath)
    return new SymbolicLink(newPath) as this
  }
  /**
   * Async version of {@link copy_sync}.
   */
  async copy(_into: Folder): Promise<this> {
    const newPath = _into.join(this.name())
    const target = await this.target()
    await fp.symlink(target.isAt, newPath)
    return new SymbolicLink(newPath) as this
  }
  /**
   * Renames this link.
   * 
   * @param _to - New name or relative path
   * @throws If link is immutable
   */
  rename_sync(_to: string): void {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    fs.renameSync(this.isAt, newPath)
    this.pointsTo = newPath
  }
  /**
   * Async version of {@link rename_sync}.
   */
  async rename(_to: string): Promise<void> {
    this.assert_mutable()
    const newPath = this.parent().join(_to)
    await fp.rename(this.isAt, newPath)
    this.pointsTo = newPath
  }
}



/**
 * Base class for special filesystem nodes that cannot be safely manipulated.
 * 
 * Includes device files, pipes, and sockets. All mutating operations
 * (delete, move, copy, rename) throw errors to prevent accidental damage.
 * 
 * Instances are frozen and marked immutable.
 * 
 * @see {@link BlockDevice}, {@link CharacterDevice}, {@link Fifo}, {@link Socket}
 */
export abstract class UnusuableRoad extends Road {
  /**
   * Immutable - modification could damage the system.
   * @default false
   */
  override readonly mutable: boolean = false

  constructor(_at: string) {
    super(_at)
    Object.freeze(this)
  }

  delete_sync(): never { throw new Error(`Cannot delete type ${this.constructor.name} at '${this.isAt}'`) }
  async delete(): Promise<never> { throw new Error(`Cannot delete type ${this.constructor.name} at '${this.isAt}'`) }
  move_sync(): never { throw new Error(`Cannot move type ${this.constructor.name} at '${this.isAt}'`) }
  async move(): Promise<never> { throw new Error(`Cannot move type ${this.constructor.name} at '${this.isAt}'`) }
  copy_sync(): never { throw new Error(`Cannot copy type ${this.constructor.name} at '${this.isAt}'`) }
  async copy(): Promise<never> { throw new Error(`Cannot copy type ${this.constructor.name} at '${this.isAt}'`) }
  rename_sync(): never { throw new Error(`Cannot rename type ${this.constructor.name} at '${this.isAt}'`) }
  async rename(): Promise<never> { throw new Error(`Cannot rename type ${this.constructor.name} at '${this.isAt}'`) }
}

/**
 * Represents a block device (e.g., `/dev/sda`).
 * 
 * Cannot be deleted, moved, copied, or renamed.
 */
export class BlockDevice extends UnusuableRoad { }
/**
 * Represents a character device (e.g., `/dev/null`).
 * 
 * Cannot be deleted, moved, copied, or renamed.
 */
export class CharacterDevice extends UnusuableRoad { }
/**
 * Represents a named pipe (FIFO).
 * 
 * Cannot be deleted, moved, copied, or renamed.
 */
export class Fifo extends UnusuableRoad { }
/**
 * Represents a socket.
 * 
 * Cannot be deleted, moved, copied, or renamed.
 */
export class Socket extends UnusuableRoad { }



/**
 * A file that auto-reloads when modified on disk.
 * 
 * Continuously monitors for changes and updates content in memory.
 * Useful for configuration files or data that's externally modified.
 * 
 * @warning Can be resource-intensive for large files or frequent changes
 * 
 * @example
 * ```ts
 * using liveFile = new LiveFile('/config.json')
 * // Content auto-updates when file changes
 * 
 * // Manually update if needed:
 * await liveFile.update()
 * console.log(liveFile.lastReadContent)
 * ```
 * 
 * @see {@link File} for file operations
 */
export class LiveFile extends File implements AsyncDisposable, Disposable {
  /**
   * Current in-memory content of the file.
   */
  lastReadContent: Buffer = Buffer.alloc(0)

  /**
   * Used to stop the monitoring loop on disposal.
   * @internal
   */
  abortController: AbortController = new AbortController()

  constructor(_at: string) {
    super(_at)
    ;(async () => {
      while (!this.abortController.signal.aborted) {
        await this.update()
        await this.on_change(this.abortController.signal)
      }
    })()
  }

  /**
   * Synchronously updates lastReadContent from disk.
   */
  update_sync(): void {
    this.lastReadContent = this.read_bytes_sync()
  }
  /**
   * Asynchronously updates lastReadContent from disk.
   */
  async update(): Promise<void> {
    this.lastReadContent = await this.read_bytes()
  }
  /**
   * Stops monitoring and disposal (synchronous).
   */
  [Symbol.dispose](): void {
    this.abortController.abort()
  }

  /**
   * Stops monitoring and disposal (asynchronous).
   */
  async [Symbol.asyncDispose](): Promise<void> {
    this.abortController.abort()
  }
}



/**
 * A temporary file that auto-deletes when disposed.
 * 
 * Created in system temp directory with a unique name.
 * Automatically deleted on cleanup.
 * 
 * @example
 * ```ts
 * using temp = new TempFile()
 * await temp.write_text('temporary data')
 * // Auto-deleted when scope exits
 * ```
 * 
 * @see {@link TempFolder} for temporary directories
 */
export class TempFile extends File implements AsyncDisposable, Disposable {
  /**
   * Mutable - can be written and deleted.
   * @default true
   */
  override readonly mutable: boolean = true

  constructor() {
    super(File.create_sync(ph.join(os.tmpdir(), `tempfile_${Date.now()}_${crypto.randomUUID()}.tmp`)).isAt)
  }

  /**
   * Deletes the temporary file (synchronous).
   */
  [Symbol.dispose](): void {
    this.delete_sync()
  }

  /**
   * Deletes the temporary file (asynchronous).
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.delete()
  }
}



/**
 * A temporary folder that auto-deletes when disposed.
 * 
 * Created in system temp directory with a unique name.
 * Automatically deleted with all contents on cleanup.
 * 
 * @example
 * ```ts
 * using temp = new TempFolder()
 * const file = await File.create(temp.join('data.txt'))
 * // Auto-deleted when scope exits
 * ```
 * 
 * @see {@link TempFile} for temporary files
 */
export class TempFolder extends Folder implements AsyncDisposable, Disposable {
  /**
   * Mutable - can contain files and be deleted.
   * @default true
   */
  override readonly mutable: boolean = true

  constructor() {
    super(Folder.create_sync(ph.join(os.tmpdir(), `tempfolder_${Date.now()}_${crypto.randomUUID()}`)).isAt)
  }

  /**
   * Deletes the temporary folder and all contents (synchronous).
   */
  [Symbol.dispose](): void {
    this.delete_sync()
  }

  /**
   * Deletes the temporary folder and all contents (asynchronous).
   */
  async [Symbol.asyncDispose](): Promise<void> {
    await this.delete()
  }
}
