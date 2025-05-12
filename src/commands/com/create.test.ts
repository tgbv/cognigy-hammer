import os from "os";
import fs, { writeFileSync } from "fs";
import path from "path";
import { createScaffold, createConnection, createNode } from "./create";
import prompts from "prompts";
import { fileIsNode, scanDirForFiles } from "../../lib";

const integrationTestsPath = path.join(os.tmpdir(), `ch_int_${Date.now()}`);
const cwd = process.cwd();
const mockExit = jest.spyOn(process, 'exit').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

jest.setTimeout(60 * 60 * 1000);


describe('createScaffold', () => {
  // clean up before each test
  beforeEach(() => {
    process.chdir(cwd);
    fs.rmSync(integrationTestsPath, { force: true, recursive: true });
    fs.mkdirSync(integrationTestsPath);
    jest.resetAllMocks();
  });

  // clean up after all tests have ended
  afterAll(() => {
    process.chdir(cwd);
    fs.rmSync(integrationTestsPath, {force: true, recursive: true});
  });


  //////////////////////////////////////////

  test('ideal scenario', async () => {
    prompts.inject([
      integrationTestsPath,
      'test-extension',
      '1.0.0',
      'description',
      ['keyword'],
      'author',
      'UNLICENSED',
      true,
    ]);

    await createScaffold();

    expect(fs.existsSync(path.join(integrationTestsPath, '.git'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'node_modules'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'jest.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'package-lock.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'assets'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'connections'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'nodes'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'index.ts'))).toBe(true);
  });

  test('location not empty -> no overwrite', async () => {
    writeFileSync(path.join(integrationTestsPath, 'test.txt'), 'test');

    prompts.inject([
      integrationTestsPath,
      false
    ]);

    await createScaffold();
    expect(mockExit).toHaveBeenCalledTimes(1);
  });

  test('location not empty -> overwrite', async () => {
    writeFileSync(path.join(integrationTestsPath, 'test.txt'), 'test');

    prompts.inject([
      integrationTestsPath,
      true,
      'test-extension',
      '1.0.0',
      'description',
      ['keyword'],
      'author',
      'UNLICENSED',
      true,
    ]);

    await createScaffold();

    expect(fs.existsSync(path.join(integrationTestsPath, '.git'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'node_modules'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'jest.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'package-lock.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'assets'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'connections'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'nodes'))).toBe(true);
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'index.ts'))).toBe(true);
  });

  test('do not set git repo', async () => {
    prompts.inject([
      integrationTestsPath,
      'test-extension',
      '1.0.0',
      'description',
      ['keyword'],
      'author',
      'UNLICENSED',
      false,
    ]);

    await createScaffold();

    expect(fs.existsSync(path.join(integrationTestsPath, '.git'))).toBe(false);
  });

});


describe('createConnection', () => {
  // clean up before each test
  beforeEach(() => {
    process.chdir(cwd);
    fs.rmSync(integrationTestsPath, { force: true, recursive: true });
    fs.mkdirSync(integrationTestsPath);
    jest.resetAllMocks();
  });

  // clean up after all tests have ended
  afterAll(() => {
    process.chdir(cwd);
    fs.rmSync(integrationTestsPath, {force: true, recursive: true});
  });

  //////////////////////////////////////////

  test('ideal scenario', async () => {
    prompts.inject([
      integrationTestsPath,
      'test-extension',
      '1.0.0',
      'description',
      ['keyword'],
      'author',
      'UNLICENSED',
      true,
    ]);

    await createScaffold();

    process.chdir(integrationTestsPath);

    prompts.inject(['Conn1']);
    await createConnection();
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'connections', 'Conn1.ts'))).toBe(true);

    prompts.inject(['Foo/Conn2']);
    await createConnection();
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'connections', 'Foo', 'Conn2.ts'))).toBe(true);

    prompts.inject(['Foo/Bar/Conn3']);
    await createConnection();
    expect(fs.existsSync(path.join(integrationTestsPath, 'src', 'connections', 'Foo', 'Bar', 'Conn3.ts'))).toBe(true);
  });
});


describe('createNode', () => {
  beforeAll(async () => {
    prompts.inject([
      integrationTestsPath,
      'test-extension',
      '1.0.0',
      'description',
      ['keyword'],
      'author',
      'UNLICENSED',
      true,
    ]);

    await createScaffold();

    process.chdir(integrationTestsPath);
  });

  afterAll(() => {
    process.chdir(cwd);
    fs.rmSync(integrationTestsPath, {force: true, recursive: true});
  });

  //////////////////////////////////////////

  test('parent', async () => {
    prompts.inject([
      'Parent',
      false,
      'regular',
      'white',
      'black',
      true,
      true,
      true,
      true,
      true,
    ]);

    await createNode();

    expect(fileIsNode(path.join(integrationTestsPath, 'src', 'nodes', 'Parent.ts'))).toBe(true);
  });

  test('child level 1', async () => {
    prompts.inject([
      'Child1',
      true,
      0,
      'mini',
      'white',
      'black',
      true,
      true,
      true,
      true,
      true,
    ]);

    await createNode();

    expect(fileIsNode(path.join(integrationTestsPath, 'src', 'nodes', 'Parent', 'Child1.ts'))).toBe(true);
  });

  test('child level 2', async () => {
    prompts.inject([
      'Child2',
      true,
      1,
      'mini',
      'white',
      'black',
      true,
      true,
      true,
      true,
      true,
    ]);

    await createNode();

    expect(fileIsNode(path.join(integrationTestsPath, 'src', 'nodes', 'Parent', 'Child1', 'Child2.ts'))).toBe(true);
  });
});
