import * as vt from 'vitest'
import * as nd from '../src/node.js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'





vt.describe("TempFile class", () => {
  
  vt.describe("basic creation", () => {
    vt.it("creates a temporary file", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile).toBeInstanceOf(nd.TempFile)
      vt.expect(tempFile).toBeInstanceOf(nd.File)
      vt.expect(tempFile).toBeInstanceOf(nd.Road)
    })

    vt.it("file exists after creation", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.exists()).toBe(true)
      vt.expect(fs.existsSync(tempFile.isAt)).toBe(true)
      tempFile.delete_self()
    })

    vt.it("creates file in system temp directory", () => {
      const tempFile = new nd.TempFile()
      const tempDir = os.tmpdir()
      vt.expect(tempFile.isAt.startsWith(tempDir)).toBe(true)
      tempFile.delete_self()
    })

    vt.it("has .tmp extension", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.ext()).toBe(".tmp")
      tempFile.delete_self()
    })

    vt.it("has TempFile_ prefix", () => {
      const tempFile = new nd.TempFile()
      const name = tempFile.name()
      vt.expect(name.startsWith("TempFile_")).toBe(true)
      tempFile.delete_self()
    })

    vt.it("creates empty file initially", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.size_in_bytes()).toBe(0)
      vt.expect(tempFile.read_text()).toBe("")
      tempFile.delete_self()
    })
  })

  vt.describe("uniqueness", () => {
    vt.it("creates unique files on multiple calls", () => {
      const temp1 = new nd.TempFile()
      const temp2 = new nd.TempFile()
      const temp3 = new nd.TempFile()
      
      vt.expect(temp1.isAt).not.toBe(temp2.isAt)
      vt.expect(temp2.isAt).not.toBe(temp3.isAt)
      vt.expect(temp1.isAt).not.toBe(temp3.isAt)
      
      temp1.delete_self()
      temp2.delete_self()
      temp3.delete_self()
    })

    vt.it("generates unique names", () => {
      const temp1 = new nd.TempFile()
      const temp2 = new nd.TempFile()
      
      vt.expect(temp1.name()).not.toBe(temp2.name())
      
      temp1.delete_self()
      temp2.delete_self()
    })

    vt.it("creates many unique temp files", () => {
      const tempFiles = Array.from({ length: 100 }, () => new nd.TempFile())
      const paths = new Set(tempFiles.map(f => f.isAt))
      
      vt.expect(paths.size).toBe(100)
      
      tempFiles.forEach(f => f.delete_self())
    })
  })

  vt.describe("Symbol.dispose integration", () => {
    vt.it("deletes file when disposed", () => {
      let filePath: string
      {
        using tempFile = new nd.TempFile()
        filePath = tempFile.isAt
        vt.expect(fs.existsSync(filePath)).toBe(true)
      }
      vt.expect(fs.existsSync(filePath)).toBe(false)
    })

    vt.it("can be used with using keyword", () => {
      let filePath: string
      {
        using tempFile = new nd.TempFile()
        filePath = tempFile.isAt
        tempFile.edit_text("test content")
        vt.expect(tempFile.read_text()).toBe("test content")
      }
      vt.expect(fs.existsSync(filePath)).toBe(false)
    })

    vt.it("disposes even if error thrown", () => {
      let filePath: string
      try {
        using tempFile = new nd.TempFile()
        filePath = tempFile.isAt
        throw new Error("intentional error")
      } catch (e) {
        vt.expect((e as Error).message).toBe("intentional error")
      }
      vt.expect(fs.existsSync(filePath!)).toBe(false)
    })
  })

  vt.describe("file operations", () => {
    vt.it("can write and read text", () => {
      const tempFile = new nd.TempFile()
      tempFile.edit_text("Hello, World!")
      vt.expect(tempFile.read_text()).toBe("Hello, World!")
      tempFile.delete_self()
    })

    vt.it("can write and read binary data", () => {
      const tempFile = new nd.TempFile()
      const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])
      tempFile.edit_binary(buffer)
      
      const readBuffer = tempFile.read_binary()
      vt.expect(readBuffer.equals(buffer)).toBe(true)
      tempFile.delete_self()
    })

    vt.it("overwrites content on edit", () => {
      const tempFile = new nd.TempFile()
      tempFile.edit_text("first")
      tempFile.edit_text("second")
      vt.expect(tempFile.read_text()).toBe("second")
      tempFile.delete_self()
    })

    vt.it("tracks size correctly", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.size_in_bytes()).toBe(0)
      
      tempFile.edit_text("12345")
      vt.expect(tempFile.size_in_bytes()).toBe(5)
      
      tempFile.edit_text("1234567890")
      vt.expect(tempFile.size_in_bytes()).toBe(10)
      
      tempFile.delete_self()
    })
  })

  vt.describe("Road methods", () => {
    vt.it("has correct type", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.type()).toBe(nd.RoadT.FILE)
      tempFile.delete_self()
    })

    vt.it("has parent folder", () => {
      const tempFile = new nd.TempFile()
      const parent = tempFile.parent()
      vt.expect(parent).toBeInstanceOf(nd.Folder)
      vt.expect(parent.isAt).toBe(os.tmpdir())
      tempFile.delete_self()
    })

    vt.it("can get stats", () => {
      const tempFile = new nd.TempFile()
      const stats = tempFile.stats()
      vt.expect(stats.isFile()).toBe(true)
      vt.expect(stats.size).toBe(0)
      tempFile.delete_self()
    })

    vt.it("has creation and modification dates", () => {
      const tempFile = new nd.TempFile()
      const created = tempFile.created_on()
      const modified = tempFile.last_modified()
      
      vt.expect(created).toBeInstanceOf(Date)
      vt.expect(modified).toBeInstanceOf(Date)
      
      tempFile.delete_self()
    })

    vt.it("can be renamed", () => {
      const tempFile = new nd.TempFile()
      const oldName = tempFile.name()
      
      tempFile.rename_self_to("custom_name.tmp")
      vt.expect(tempFile.name()).toBe("custom_name.tmp")
      vt.expect(tempFile.name()).not.toBe(oldName)
      
      tempFile.delete_self()
    })
  })

  vt.describe("collision avoidance", () => {
    vt.it("avoids collision with existing file", () => {
      const temp1 = new nd.TempFile()
      
      // Manually delete to test collision logic
      const firstPath = temp1.isAt
      temp1.delete_self()
      
      // Recreate file at same path
      fs.writeFileSync(firstPath, "collision test")
      
      // New TempFile should avoid this path
      const temp2 = new nd.TempFile()
      vt.expect(temp2.isAt).not.toBe(firstPath)
      
      temp2.delete_self()
      fs.unlinkSync(firstPath)
    })
  })

  vt.describe("cleanup", () => {
    vt.it("delete_self removes file from disk", () => {
      const tempFile = new nd.TempFile()
      const filePath = tempFile.isAt
      
      vt.expect(fs.existsSync(filePath)).toBe(true)
      tempFile.delete_self()
      vt.expect(fs.existsSync(filePath)).toBe(false)
    })

    vt.it("exists returns false after deletion", () => {
      const tempFile = new nd.TempFile()
      vt.expect(tempFile.exists()).toBe(true)
      
      tempFile.delete_self()
      vt.expect(tempFile.exists()).toBe(false)
    })

    vt.it("can safely call delete_self multiple times", () => {
      const tempFile = new nd.TempFile()
      tempFile.delete_self()
      vt.expect(() => tempFile.delete_self()).not.toThrow()
    })
  })

  vt.describe("edge cases", () => {
    vt.it("handles large text content", () => {
      const tempFile = new nd.TempFile()
      const largeText = "x".repeat(1000000)
      
      tempFile.edit_text(largeText)
      vt.expect(tempFile.read_text()).toBe(largeText)
      vt.expect(tempFile.size_in_bytes()).toBe(1000000)
      
      tempFile.delete_self()
    })

    vt.it("handles binary data", () => {
      const tempFile = new nd.TempFile()
      const binaryData = Buffer.alloc(10000)
      for (let i = 0; i < binaryData.length; i++) {
        binaryData[i] = i % 256
      }
      
      tempFile.edit_binary(binaryData)
      const readData = tempFile.read_binary()
      vt.expect(readData.equals(binaryData)).toBe(true)
      
      tempFile.delete_self()
    })

    vt.it("handles empty writes", () => {
      const tempFile = new nd.TempFile()
      tempFile.edit_text("content")
      tempFile.edit_text("")
      
      vt.expect(tempFile.read_text()).toBe("")
      vt.expect(tempFile.size_in_bytes()).toBe(0)
      
      tempFile.delete_self()
    })

    vt.it("handles unicode content", () => {
      const tempFile = new nd.TempFile()
      const unicode = "Hello 世界 🌍 مرحبا"
      
      tempFile.edit_text(unicode)
      vt.expect(tempFile.read_text()).toBe(unicode)
      
      tempFile.delete_self()
    })
  })
})

vt.describe("TempFolder class", () => {
  
  vt.describe("basic creation", () => {
    vt.it("creates a temporary folder", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder).toBeInstanceOf(nd.TempFolder)
      vt.expect(tempFolder).toBeInstanceOf(nd.Folder)
      vt.expect(tempFolder).toBeInstanceOf(nd.Road)
      tempFolder.delete_self()
    })

    vt.it("folder exists after creation", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder.exists()).toBe(true)
      vt.expect(fs.existsSync(tempFolder.isAt)).toBe(true)
      tempFolder.delete_self()
    })

    vt.it("creates folder in system temp directory", () => {
      const tempFolder = new nd.TempFolder()
      const tempDir = os.tmpdir()
      vt.expect(tempFolder.isAt.startsWith(tempDir)).toBe(true)
      tempFolder.delete_self()
    })

    vt.it("has TempFolder_ prefix", () => {
      const tempFolder = new nd.TempFolder()
      const name = tempFolder.name()
      vt.expect(name.startsWith("TempFolder_")).toBe(true)
      tempFolder.delete_self()
    })

    vt.it("creates empty folder initially", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder.list()).toEqual([])
      tempFolder.delete_self()
    })
  })

  vt.describe("uniqueness", () => {
    vt.it("creates unique folders on multiple calls", () => {
      const temp1 = new nd.TempFolder()
      const temp2 = new nd.TempFolder()
      const temp3 = new nd.TempFolder()
      
      vt.expect(temp1.isAt).not.toBe(temp2.isAt)
      vt.expect(temp2.isAt).not.toBe(temp3.isAt)
      vt.expect(temp1.isAt).not.toBe(temp3.isAt)
      
      temp1.delete_self()
      temp2.delete_self()
      temp3.delete_self()
    })

    vt.it("generates unique names", () => {
      const temp1 = new nd.TempFolder()
      const temp2 = new nd.TempFolder()
      
      vt.expect(temp1.name()).not.toBe(temp2.name())
      
      temp1.delete_self()
      temp2.delete_self()
    })

    vt.it("creates many unique temp folders", () => {
      const tempFolders = Array.from({ length: 100 }, () => new nd.TempFolder())
      const paths = new Set(tempFolders.map(f => f.isAt))
      
      vt.expect(paths.size).toBe(100)
      
      tempFolders.forEach(f => f.delete_self())
    })
  })

  vt.describe("Symbol.dispose integration", () => {
    vt.it("deletes folder when disposed", () => {
      let folderPath: string
      {
        using tempFolder = new nd.TempFolder()
        folderPath = tempFolder.isAt
        vt.expect(fs.existsSync(folderPath)).toBe(true)
      }
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("deletes folder with contents when disposed", () => {
      let folderPath: string
      {
        using tempFolder = new nd.TempFolder()
        folderPath = tempFolder.isAt
        
        fs.writeFileSync(path.join(folderPath, "test.txt"), "content")
        fs.mkdirSync(path.join(folderPath, "subfolder"))
        fs.writeFileSync(path.join(folderPath, "subfolder", "nested.txt"), "nested")
      }
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("can be used with using keyword", () => {
      let folderPath: string
      {
        using tempFolder = new nd.TempFolder()
        folderPath = tempFolder.isAt
        fs.writeFileSync(path.join(tempFolder.isAt, "file.txt"), "test")
        vt.expect(tempFolder.list().length).toBe(1)
      }
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("disposes even if error thrown", () => {
      let folderPath: string
      try {
        using tempFolder = new nd.TempFolder()
        folderPath = tempFolder.isAt
        throw new Error("intentional error")
      } catch (e) {
        vt.expect((e as Error).message).toBe("intentional error")
      }
      vt.expect(fs.existsSync(folderPath!)).toBe(false)
    })
  })

  vt.describe("folder operations", () => {
    vt.it("can list empty contents", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder.list()).toEqual([])
      tempFolder.delete_self()
    })

    vt.it("can list files in folder", () => {
      const tempFolder = new nd.TempFolder()
      
      fs.writeFileSync(path.join(tempFolder.isAt, "file1.txt"), "")
      fs.writeFileSync(path.join(tempFolder.isAt, "file2.txt"), "")
      
      const contents = tempFolder.list()
      vt.expect(contents.length).toBe(2)
      
      tempFolder.delete_self()
    })

    vt.it("can find specific file", () => {
      const tempFolder = new nd.TempFolder()
      fs.writeFileSync(path.join(tempFolder.isAt, "target.txt"), "found me")
      
      const found = tempFolder.find("target.txt")
      vt.expect(found).toBeDefined()
      vt.expect(found).toBeInstanceOf(nd.File)
      
      tempFolder.delete_self()
    })

    vt.it("returns undefined when file not found", () => {
      const tempFolder = new nd.TempFolder()
      const found = tempFolder.find("nonexistent.txt")
      vt.expect(found).toBeUndefined()
      tempFolder.delete_self()
    })

    vt.it("can create nested structure", () => {
      const tempFolder = new nd.TempFolder()
      
      fs.mkdirSync(path.join(tempFolder.isAt, "subfolder"))
      fs.writeFileSync(path.join(tempFolder.isAt, "subfolder", "nested.txt"), "nested content")
      
      const subfolder = tempFolder.find("subfolder")
      vt.expect(subfolder).toBeInstanceOf(nd.Folder)
      
      tempFolder.delete_self()
    })
  })

  vt.describe("Road methods", () => {
    vt.it("has correct type", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder.type()).toBe(nd.RoadT.FOLDER)
      tempFolder.delete_self()
    })

    vt.it("has parent folder", () => {
      const tempFolder = new nd.TempFolder()
      const parent = tempFolder.parent()
      vt.expect(parent).toBeInstanceOf(nd.Folder)
      vt.expect(parent.isAt).toBe(os.tmpdir())
      tempFolder.delete_self()
    })

    vt.it("can get stats", () => {
      const tempFolder = new nd.TempFolder()
      const stats = tempFolder.stats()
      vt.expect(stats.isDirectory()).toBe(true)
      tempFolder.delete_self()
    })

    vt.it("has creation and modification dates", () => {
      const tempFolder = new nd.TempFolder()
      const created = tempFolder.created_on()
      const modified = tempFolder.last_modified()
      
      vt.expect(created).toBeInstanceOf(Date)
      vt.expect(modified).toBeInstanceOf(Date)
      
      tempFolder.delete_self()
    })

    vt.it("can be renamed", () => {
      const tempFolder = new nd.TempFolder()
      const oldName = tempFolder.name()
      
      tempFolder.rename_self_to("custom_folder")
      vt.expect(tempFolder.name()).toBe("custom_folder")
      vt.expect(tempFolder.name()).not.toBe(oldName)
      
      tempFolder.delete_self()
    })
  })

  vt.describe("collision avoidance", () => {
    vt.it("avoids collision with existing folder", () => {
      const temp1 = new nd.TempFolder()
      
      const firstPath = temp1.isAt
      temp1.delete_self()
      
      fs.mkdirSync(firstPath)
      
      const temp2 = new nd.TempFolder()
      vt.expect(temp2.isAt).not.toBe(firstPath)
      
      temp2.delete_self()
      fs.rmdirSync(firstPath)
    })
  })

  vt.describe("cleanup with contents", () => {
    vt.it("deletes folder with files", () => {
      const tempFolder = new nd.TempFolder()
      const folderPath = tempFolder.isAt
      
      fs.writeFileSync(path.join(folderPath, "file1.txt"), "content1")
      fs.writeFileSync(path.join(folderPath, "file2.txt"), "content2")
      fs.writeFileSync(path.join(folderPath, "file3.txt"), "content3")
      
      tempFolder.delete_self()
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("deletes folder with nested folders", () => {
      const tempFolder = new nd.TempFolder()
      const folderPath = tempFolder.isAt
      
      fs.mkdirSync(path.join(folderPath, "sub1"))
      fs.mkdirSync(path.join(folderPath, "sub2"))
      fs.mkdirSync(path.join(folderPath, "sub1", "deep"))
      fs.writeFileSync(path.join(folderPath, "sub1", "deep", "file.txt"), "deep content")
      
      tempFolder.delete_self()
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("deletes folder with many files", () => {
      const tempFolder = new nd.TempFolder()
      const folderPath = tempFolder.isAt
      
      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(path.join(folderPath, `file${i}.txt`), `content ${i}`)
      }
      
      tempFolder.delete_self()
      vt.expect(fs.existsSync(folderPath)).toBe(false)
    })

    vt.it("exists returns false after deletion", () => {
      const tempFolder = new nd.TempFolder()
      vt.expect(tempFolder.exists()).toBe(true)
      
      tempFolder.delete_self()
      vt.expect(tempFolder.exists()).toBe(false)
    })

    vt.it("can safely call delete_self multiple times", () => {
      const tempFolder = new nd.TempFolder()
      tempFolder.delete_self()
      vt.expect(() => tempFolder.delete_self()).not.toThrow()
    })
  })

  vt.describe("edge cases", () => {
    vt.it("handles deeply nested structure", () => {
      const tempFolder = new nd.TempFolder()
      
      let currentPath = tempFolder.isAt
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`)
        fs.mkdirSync(currentPath)
      }
      fs.writeFileSync(path.join(currentPath, "deep.txt"), "very deep")
      
      tempFolder.delete_self()
      vt.expect(fs.existsSync(tempFolder.isAt)).toBe(false)
    })

    vt.it("handles mixed content", () => {
      const tempFolder = new nd.TempFolder()
      
      fs.writeFileSync(path.join(tempFolder.isAt, "file.txt"), "file")
      fs.mkdirSync(path.join(tempFolder.isAt, "folder"))
      fs.writeFileSync(path.join(tempFolder.isAt, "folder", "nested.txt"), "nested")
      
      const contents = tempFolder.list()
      vt.expect(contents.length).toBe(2)
      
      tempFolder.delete_self()
    })
  })

  vt.describe("concurrent usage", () => {
    vt.it("can create multiple temp folders simultaneously", () => {
      const folders = Array.from({ length: 10 }, () => new nd.TempFolder())
      
      folders.forEach(f => vt.expect(f.exists()).toBe(true))
      
      const paths = new Set(folders.map(f => f.isAt))
      vt.expect(paths.size).toBe(10)
      
      folders.forEach(f => f.delete_self())
    })
  })
})

vt.describe("TempFile and TempFolder integration", () => {
  vt.it("TempFile and TempFolder coexist", () => {
    const tempFile = new nd.TempFile()
    const tempFolder = new nd.TempFolder()
    
    vt.expect(tempFile.exists()).toBe(true)
    vt.expect(tempFolder.exists()).toBe(true)
    vt.expect(tempFile.isAt).not.toBe(tempFolder.isAt)
    
    tempFile.delete_self()
    tempFolder.delete_self()
  })

  vt.it("can create TempFile inside TempFolder", () => {
    const tempFolder = new nd.TempFolder()
    const filePath = path.join(tempFolder.isAt, "temp.txt")
    
    fs.writeFileSync(filePath, "content")
    
    const file = tempFolder.find("temp.txt")
    vt.expect(file).toBeInstanceOf(nd.File)
    
    tempFolder.delete_self()
  })

  vt.it("disposing TempFolder removes all files inside", () => {
    let folderPath: string
    {
      using tempFolder = new nd.TempFolder()
      folderPath = tempFolder.isAt
      
      fs.writeFileSync(path.join(folderPath, "file1.txt"), "1")
      fs.writeFileSync(path.join(folderPath, "file2.txt"), "2")
      fs.writeFileSync(path.join(folderPath, "file3.txt"), "3")
    }
    
    vt.expect(fs.existsSync(folderPath)).toBe(false)
  })
})