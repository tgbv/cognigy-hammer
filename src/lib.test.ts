import os from "os";
import fs from "fs";
import path from "path";
import { cwdIsInExtensionProject, fileIsNode, scanDirForFiles, ucFirst } from "./lib";

const integrationTestsPath = path.join(os.tmpdir(), `ch_int_${Date.now()}`);
const cwd = process.cwd();

// clean up before each test
beforeEach(() => {
  process.chdir(cwd);
  fs.rmSync(integrationTestsPath, {force: true, recursive: true});
  fs.mkdirSync(integrationTestsPath);
});

// clean up after all tests have ended
afterAll(() => {
  process.chdir(cwd);
  fs.rmSync(integrationTestsPath, {force: true, recursive: true});
});

test('scanDirForFiles', () => {

  const pathToChild3 = path.join(integrationTestsPath, 'child1', 'child2', 'child3');
  const pathToChild4 = path.join(integrationTestsPath, 'child4');

  const filePaths = [
    path.join(integrationTestsPath, 'file1.ts'),
    path.join(integrationTestsPath, 'file2.ts'),
    path.join(integrationTestsPath, 'child1', 'file3.ts'),
    path.join(integrationTestsPath, 'child1', 'child2', 'file4.ts'),
    path.join(integrationTestsPath, 'child4', 'file5.ts'),
  ];

  // create mock files
  fs.mkdirSync(pathToChild3, {recursive: true});
  fs.mkdirSync(pathToChild4);
  filePaths.forEach(p => fs.writeFileSync(p, `${Date.now()}`));

  const scannedFiles = scanDirForFiles(integrationTestsPath);

  expect(scannedFiles).toEqual(filePaths);
});

test('fileIsNode [true]', () => {
  fs.mkdirSync(path.join(integrationTestsPath, 'child1'), {recursive: true});
  fs.writeFileSync(path.join(integrationTestsPath, 'child1', 'node.ts'), `//...\nconst descriptor = createNodeDescriptor(__filename);\n//...`);

  expect(fileIsNode(path.join(integrationTestsPath, 'child1', 'node.ts'))).toBe(true);
});

test('fileIsNode [false]', () => {
  fs.mkdirSync(path.join(integrationTestsPath, 'child1'), {recursive: true});
  fs.writeFileSync(path.join(integrationTestsPath, 'child1', 'node.ts'), `//...\nconst descriptor = createNodeDescriptor({type: 'node'});\n//...`);

  expect(fileIsNode(path.join(integrationTestsPath, 'child1', 'node.ts'))).toBe(false);
});

test('cwdIsInExtensionProject [true]', () => {
  fs.writeFileSync(path.join(integrationTestsPath, 'package.json'), `{"isCognigyExtension":true}`);
  process.chdir(integrationTestsPath);
  expect(cwdIsInExtensionProject()).toBe(true);
});

test('cwdIsInExtensionProject [false]', () => {
  fs.writeFileSync(path.join(integrationTestsPath, 'package.json'), `{}`);
  process.chdir(integrationTestsPath);
  expect(cwdIsInExtensionProject()).toBe(false);
});

test('ucFirst', () => {
  expect(ucFirst('hello')).toBe('Hello');
});
