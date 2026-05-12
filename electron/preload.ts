import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronApi', {
  pickLibraryFolder: () => ipcRenderer.invoke('library:pick') as Promise<string | null>,
  readLibrary: (libraryPath: string) => ipcRenderer.invoke('library:read', libraryPath),
})
