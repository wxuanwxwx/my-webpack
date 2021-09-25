#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const colors = require('colors-console')
// https://www.npmjs.com/package/node-console-colors
const iconvLite = require('iconv-lite');
const cmd = require('child_process');
const root = process.cwd();
const appInfo = require('../package.json');
const animals = fs.readFileSync(path.join(__dirname, '../log/animals.txt'), 'utf-8').toString().split('===============++++SEPERATOR++++====================\n');
let ENV = 'dev';
let newTime = 0;
let timerId = undefined;
let configUrl = 'config.dev.json';
const cdHBuilderXUrl = 'D:\\UNIAPP\\HBuilderX';
const cdRootUrl = 'cd /';
const cmdStr = 'cli pack --config';
const randomAnimal = () => {
  return animals[Math.floor(Math.random() * animals.length)];
}
const startLoad = () => {
  const P = ["\\", "|", "/", "-"];
  let x = 0;
  newTime = Date.parse(new Date());
  timerId = setInterval(function () {
    process.stdout.write(`\r ${P[x++]}  以打包:${getTime(newTime)}`);
    x &= 3;
  }, 120);
};
const endLoad = () => {
  process.stdout.write(`\r 打包成功，共打包${getTime(newTime)}！`);
  clearInterval(timerId);
  newTime = 0;
  timerId = 0;
}
const openCmd = (baseUrl) => {
  cmd.exec(`${cmdStr} ${baseUrl}`, (error, stdout, stderr) => {
    endLoad();
    if (error) {
      console.log('error：', error);
    } else if (stdout) {
      fs.writeFile(path.join(__dirname, '../log/log.txt'), JSON.stringify(stdout), (err) => {
        console.log('\r 写入成功！', err);
      });
      try {
        console.log('\r stdout：', iconvLite.decode(new Buffer.from(stdout, 'binary'), 'CP936'));
      } catch (error) {
        process.stdout.write(`\r stdout：${iconvLite.decode(stdout, 'CP936')}`);
      }
    } else if (stderr) {
      console.log('stderr：', stderr);
    }
  })
}

const getTime = (dateBegin) => {
  let dateEnd = new Date();
  let dateDiff = dateEnd.getTime() - dateBegin;
  let leave1 = dateDiff % (24 * 3600 * 1000)
  let hours = Math.floor(leave1 / (3600 * 1000))
  let leave2 = leave1 % (3600 * 1000)
  let minutes = Math.floor(leave2 / (60 * 1000))
  let leave3 = leave2 % (60 * 1000)
  let seconds = Math.round(leave3 / 1000)
  let str = ``;
  if (hours) {
    str += ` ${hours}小时 ${minutes}分钟`;
  } else if (minutes) {
    str += ` ${minutes}分钟`;
  }
  str += ` ${seconds}秒 `;
  return str;
}
const implement = (baseUrl) => {
  const animal = randomAnimal();
  console.log(`\n\n${animal}\n\n`);
  console.log(` 正在排队打包中...\n`);
  startLoad();
  openCmd(baseUrl);
}
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
    console.log(colors('red', `${root}目录下没有找到${configUrl}文件`));
  } else {
    let template = JSON.parse(fs.readFileSync(baseUrl, 'utf-8'));
    const formatRoot = root.replace(/\\+/g, '/');
    if (template.project !== formatRoot) {
      const formatConfig = path.join(root, '\\manifest.json').replace(/\\+/g, '/');
      template.project = formatRoot;
      template.config = formatConfig;
      fs.writeFile(baseUrl, JSON.stringify(template), (err) => {
        if (err) {
          console.log(colors('red', `写入${configUrl}文件失败！`));
        } else {
          implement(baseUrl);
        }
      });
    } else {
      implement(baseUrl);
    }
  }
}
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
      console.log(`\n 开始执行打包命令: ${colors('yellow', '开发环境...')}`);
      start();
    } else if (ENV === 'prod') {
      console.log(`\n 开始执行打包命令: ${colors('yellow', '生产环境...')}`);
      start();
    } else {
      console.log(`\n${colors('redBG', '\n 打包命令错误,默认开发环境, pack uni build prod为生产环境,请输入正确命令！')}`);
    }
  });
program.parse(process.argv);


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