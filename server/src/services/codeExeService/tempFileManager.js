import fs from 'fs/promises'
import path from 'path'
import { ApiError } from '../../utils/ApiError.js';

export const getFileNameWithExtension = (language) => {
    switch (language) {
        case 'javascript':
            return 'main.js';
        case 'python':
            return 'main.py';
        case 'java':
            return 'Main.java';
        case 'cpp':
            return 'main.cpp';
        default:
            throw new ApiError(400, "Unsupported Language")
    }
}

export const saveUserCode = async (code, language) => {
    const TEMP_DIR = path.join(process.cwd(), 'temp')
    
    await fs.mkdir(TEMP_DIR, { recursive: true })

    const fileNameWithExtension = getFileNameWithExtension(language)
    const filePath = path.join(TEMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameWithExtension}`)
    await fs.writeFile(filePath, code)

    return filePath
}

export const deleteUserCodeFile = async (filePath) => {
    try {
        await fs.unlink(filePath)
    } catch (err) {
        console.error(`Error while deleting file: ${filePath}`, err.message)
    }
}