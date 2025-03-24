import fs from "node:fs/promises";
import * as fsSync from "node:fs";

/**
 * Gets the names of all first-level directories within a given directory.
 *
 * @param {string} dirPath The path to the directory to scan.
 * @returns {Promise<string[]>} A promise that resolves with an array of
 * directory names.
 * @throws {Error} If the directory does not exist or if there is an error
 * reading the directory.
 */
export async function getFirstLevelDirNames(dirPath: string) {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((item) => item.name);
  } catch (error) {
    console.error(`Error reading directory: ${dirPath}`, error);
    throw error;
  }
}

/**
 * Gets the names of all first-level directories within a given directory
 * (synchronous version).
 *
 * @param {string} dirPath The path to the directory to scan.
 * @returns {string[]} An array of directory names.
 * @throws {Error} If the directory does not exist or if there is an error
 * reading the directory.
 */
export function getFirstLevelDirNamesSync(dirPath: string) {
  try {
    const items = fsSync.readdirSync(dirPath, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((item) => item.name);
  } catch (error) {
    console.error(`Error reading directory: ${dirPath}`, error);
    throw error;
  }
}

export default getFirstLevelDirNamesSync;
