import path from 'path'
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'fs'

import { getBundledRgPath } from '@codebuff/sdk'

import { getCliEnv } from '../utils/env'
import { logger } from '../utils/logger'

const getRipgrepPath = async (): Promise<string> => {
  const env = getCliEnv()
  if (!env.CODEBUFF_IS_BINARY) {
    return getBundledRgPath()
  }
  const binaryDir = path.dirname(process.execPath)
  const rgFileName = process.platform === 'win32' ? 'rg.exe' : 'rg'
  const outPath = path.join(binaryDir, rgFileName)
  if (existsSync(outPath)) {
    return outPath
  }
  try {
    let embeddedRgPath: string
    if (process.platform === 'darwin' && process.arch === 'arm64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/arm64-darwin/rg')
    } else if (process.platform === 'darwin' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-darwin/rg')
    } else if (process.platform === 'linux' && process.arch === 'arm64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/arm64-linux/rg')
    } else if (process.platform === 'linux' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-linux/rg')
    } else if (process.platform === 'win32' && process.arch === 'x64') {
      embeddedRgPath = require('../../../sdk/dist/vendor/ripgrep/x64-win32/rg.exe')
    } else {
      throw new Error('Unsupported platform: ' + process.platform + '-' + process.arch)
    }
    const embeddedBuffer = readFileSync(embeddedRgPath)
    writeFileSync(outPath, embeddedBuffer)
    if (process.platform !== 'win32') {
      chmodSync(outPath, 0o755)
    }
    return outPath
  } catch (error) {
    logger.error({ error }, 'Failed to extract ripgrep binary')
    return getBundledRgPath()
  }
}
let rgPathPromise: Promise<string> | null = null
export const getRgPath = (): Promise<string> => {
  if (!rgPathPromise) {
    rgPathPromise = getRipgrepPath()
  }
  return rgPathPromise
}
export const resetRgPathCache = (): void => {
  rgPathPromise = null
}
