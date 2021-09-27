#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const colors = require('colors-console')
// https://www.npmjs.com/package/node-console-colors
const iconvLite = require('iconv-lite');
const WindowsToaster = require('node-notifier').WindowsToaster;
const notifier = new WindowsToaster({
  withFallback: false, // Fallback to Growl or Balloons?
  customPath: undefined // Relative/Absolute path if you want to use your fork of SnoreToast.exe
});
const inquirer = require("inquirer");

const http = require('http');
const cmd = require('child_process');
const root = process.cwd();
const appInfo = require('../package.json');
const animals = fs.readFileSync(path.join(__dirname, '../log/animals.txt'), 'utf-8').toString().split('===============++++SEPERATOR++++====================\n');
const manifest = fs.readFileSync(path.join(root, 'manifest.json'), 'utf-8');
let ENV = 'dev';
let newTime = 0;
let timerId = undefined;
let configUrl = 'config.dev.json';
const cdHBuilderXUrl = 'D:\\UNIAPP\\HBuilderX';
const cdRootUrl = 'cd /';
const cmdStr = 'cli pack --config';
const encoding = 'cp936';
const binaryEncoding = 'binary';
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
  process.stdout.write(`\r打包成功，共打包${getTime(newTime)}`);
  clearInterval(timerId);
  newTime = 0;
  timerId = 0;
}
const escape = (message) => {
  return iconvLite.decode(new Buffer.from(message, binaryEncoding), encoding).replace(/\d(\d|:|.)*( )/, '');
}
const openCmd = (baseUrl) => {
  const childProcess = cmd.exec(`${cmdStr} ${baseUrl}`, { encoding: binaryEncoding, signal: true }, (error, stdout, stderr) => {
    endLoad();
    pushMsg();
    if (error) {
      console.log('\n\n error：', escape(error));
    } else if (stdout) {
      console.log(`\n\n ${escape(stdout)}`);
    } else if (stderr) {
      console.log('\n\n stderr：', escape(stderr));
    }
  })
  childProcess.stdout.on('data', (data) => {
    let log = escape(data);
    // console.log(log)
    process.stdout.write(`\r ${colors('yellow', log)}\n`);
  });
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
const getStrValue = (key, data) => {
  const matchReg = eval(`/"${key}".*?(?=\,)/`);
  const str = data.match(matchReg)[0] || '';
  const strList = str.replace(/("|'|‘|’|“|”)+/g, '').split(':');
  const value = strList[1] || '';
  return value;
}

const pushMsg = (baseUrl) => {
  const name = getStrValue('name', manifest);
  const versionName = getStrValue('versionName', manifest);
  const versionCode = getStrValue('versionCode', manifest);
  notifier.notify({
    title: `${name}（${ENV === 'dev' ? '测试' : '正式'}）`,
    message: `${versionName}（${versionCode}）打包成功！`,
    icon: path.join(__dirname, '../logo/log10.png'),
    sound: true, 
    appID: 'pack',
    appName: '打包程序',
    time: 60000,
    timeout: 60,
    actions: '1',
    sticky: true
  });
  notifier.on('click', (notifierObject, options, event) => {
    console.log('点击')
  });
}
const implement = (baseUrl) => {
  const animal = randomAnimal();
  console.log(`\n\n${animal}\n\n`);
  console.log(` 正在编译打包中...\n`);
  startLoad();
  openCmd(baseUrl);
}
const createServer = (template) => {
  http.createServer(function (request, response) {
    response.writeHeader(200, {
      'Content-Type': 'text/html;charset:utf-8'
    });
    response.end(template);
  }).listen(8888);
  // 终端打印如下信息
  console.log('\r Server running at http://127.0.0.1:8888/');
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
uni
  .command('switch [name]')
  .action(name => {
    console.log(name);
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