
/**
 * cli入口文件
 * 
 * author: linyonming
 */

'use strict'
const { checkVersion, checkGitInstalled, isOnline } = require('../common/util');
const LOG = require('../common/log');
const program = require('commander')
const tools = require('../common/util')
isOnline().then( _ => {
  program.version(require('../package').version,'-v','-version')

  program
      .usage('<linyongming>')

  /*
  ** 项目初始化
  */
  program
      .command('init')
      .description('项目初始化，可选择插件模版、组件模版、PC项目模版和H5模版，默认PC')
      .alias('i')
      .action( () => require('./init') )

  /*
  ** 文件生成
  */
  program
      .command('generator')
      .description('模版生成器，主要生成项目文件，路由文件，引入插件，组件')
      .alias('g')
      .action( ( ) => require('./generator') )

  program.parse(process.argv)
  if(!program.args.length){
    program.help()
  }
} , () => {
  LOG.error('错误提示：使用create-lym-app初始化项目必须在有网络状态下')
})