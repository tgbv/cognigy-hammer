import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";

/**
 * @param dirPath Directory path you want to scan.
 * @returns Full path of all files in a directory and its subdirectories.
 */
export function scanDirForFiles (dirPath: string): string[] {
  if(!existsSync(dirPath)) {
    return [];
  }
  
  let files = readdirSync(resolve(dirPath), { withFileTypes: true });
  const directories = files.filter(f => f.isDirectory());
  files = files.filter(f => !f.isDirectory());

  const recursiveFiles: string[] = [];

  for (const d of directories) {
    recursiveFiles.push(...scanDirForFiles( resolve(dirPath, d.name) ));
  }

  return files.map(f => ( resolve(dirPath, f.name) )).concat(recursiveFiles);
}

/**
 * Determines if a file is a node.
 * 
 * @param targetPath 
 * @returns 
 */
export function fileIsNode(targetPath: string): boolean {
  return readFileSync(targetPath).toString().includes('createNodeDescriptor(__filename)');
}

/**
 * Determine if cwd is in an extension project.
 * 
 * @returns boolean
 */
export function cwdIsInExtensionProject(): boolean {
  return existsSync('./package.json') && 
    JSON.parse(readFileSync('./package.json').toString()).isCognigyExtension
}

/**
 * 
 * @param input 
 * @returns 
 */
export function ucFirst(input: string): string {
  return input[0].toUpperCase() + input.slice(1);
}
