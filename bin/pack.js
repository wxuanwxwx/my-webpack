#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const cmd = require('child_process');
const root = process.cwd();
const appInfo = require('../package.json');
let ENV = 'dev';
let configUrl = 'config.dev.json';
const cdHBuilderXUrl = 'D:\\UNIAPP\\HBuilderX';
const cdRootUrl = 'cd /';
const cmdStr = 'cli pack --config';
const color = {
  'bold': '\x1B[1m%s\x1B[22m',
  'italic': '\x1B[3m%s\x1B[23m',
  'underline': '\x1B[4m%s\x1B[24m',
  'inverse': '\x1B[7m%s\x1B[27m',
  'strikethrough': '\x1B[9m%s\x1B[29m',
  'white': '\x1B[37m%s\x1B[39m',
  'grey': '\x1B[90m%s\x1B[39m',
  'black': '\x1B[30m%s\x1B[39m',
  'blue': '\x1B[34m%s\x1B[39m',
  'cyan': '\x1B[36m%s\x1B[39m',
  'green': '\x1B[32m%s\x1B[39m',
  'magenta': '\x1B[35m%s\x1B[39m',
  'red': '\x1B[31m%s\x1B[39m',
  'yellow': '\x1B[33m%s\x1B[39m',
  'whiteBG': '\x1B[47m%s\x1B[49m',
  'greyBG': '\x1B[49;5;8m%s\x1B[49m',
  'blackBG': '\x1B[40m%s\x1B[49m',
  'blueBG': '\x1B[44m%s\x1B[49m',
  'cyanBG': '\x1B[46m%s\x1B[49m',
  'greenBG': '\x1B[42m%s\x1B[49m',
  'magentaBG': '\x1B[45m%s\x1B[49m',
  'redBG': '\x1B[41m%s\x1B[49m',
  'yellowBG': '\x1B[43m%s\x1B[49m'
};
program
  .version(appInfo.version)
  .option('-e, --explain', '这是一个用于uniapp打包Android和IOS的自定义脚本！')
  .option('-v, --version', appInfo.version)
  .option('-r, --root', root);
const uni = program.command('uni');
uni
  .command('build [env]')
  .action(env => {
    env && (ENV = env);
    configUrl = `config.${ENV}.json`;
  })
  .hook('postAction', () => {
    if (ENV === 'dev') {
      console.log('开始执行打包命令：开发环境...');
    } else if (ENV === 'prod') {
      console.log('开始执行打包命令：生产环境...');
    } else {
      console.log(color['redBG'], `打包命令错误,默认开发环境, pack uni build prod为生产环境,请输入正确命令！`);
    }
  });
program.parse(process.argv);
const start = () => {
  const baseUrl = path.join(root, configUrl);
  let isFile = true;
  try {
    const statsObj = fs.statSync(baseUrl);
    isFile = statsObj.isFile();
  } catch (error) {
    isFile = false;
  }
  if (!isFile) {
    console.log(color['red'], `${root}目录下没有找到${configUrl}文件`);
  } else {
    const template = fs.readFileSync(baseUrl, 'utf-8');
    cmd.exec(`${cmdStr} ${baseUrl}`, (error, stdout, stderr) => {
      if(error) console.log('error：', error);
      else if(stdout) console.log('stdout：', stdout);
      else if(stderr) console.log('stderr：', stderr);
    })
  }
}
start();