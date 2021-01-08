

const LOG = require('../common/log');

class generate{
  constructor(){
    this.logInfo()
  }
  logInfo(){
    LOG.info('模版生成器，主要生成项目文件，路由文件，引入插件，组件')
  }
}
module.exports = new generate()