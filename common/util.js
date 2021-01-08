/**
 * 工具类封装
 * 
 * author: linyongming
 */

const axios = require('axios');
const ora = require('ora');
const Log = require('./log');
const shell = require('shelljs');
const dns = require('dns');
const fs = require('fs');
const path = require('path')
const efs = require('fs-extra');
const { createLymApp_NPM_REGISTRY,PROJECT_PACKAGE_JSON  } = require('./constant');
const _ = require('lodash');
/**
 * 删除指定目录文件
 * 
 * @param {String} path 
 */
async function deleteFiles(path) {
    let files = [];

    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFiles(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(path);
    }
}


 
const tools = {

   /**
   * 合并package.json信息
   */
  /**
    * @description: 
    * @param {*} cwd process.cwd
    * @param {*} projectName 项目名称
    * @param {*} answers 用户交互选项
    */
   mergePackageJson:async (cwd, projectName, answers) => {
      let filePath = path.resolve(cwd, `./${projectName}/` + PROJECT_PACKAGE_JSON);
      let packageInfo ;
      if (fs.existsSync(filePath)) {
        packageInfo = require(filePath);
        if (packageInfo) {
            packageInfo = _.merge(packageInfo, answers);
            try {
                let str = JSON.stringify(packageInfo, null, 4);
                await fs.writeFileSync(filePath, str)
            } catch (e) {
                throw new Error(e)
            }
        }
      }
    },


    /**
     * 获取问题列表
     */
    getQuestionList : async () => {
      // let gitInfo = await getGitConfig();
      return [
          {
              'type': 'list',
              'name': 'templateName',
              'message': '请选择要下载的模版',
              'choices': ['Admin', 'Mobile','Plugin','Component'],
              'default': 'Admin',
              'pageSize': 1000
          }, {
              'type': 'input',
              'name': 'name',
              'message': '请输入项目名称：',
              'default': 'lym-project'
          }, {
              'type': 'input',
              'name': 'author',
              'message': '请输入项目作者：',
              'default': ''
          }, {
              'type': 'input',
              'name': 'email',
              'message': '请输入email：',
              'default': ''
          }, {
              'type': 'input',
              'name': 'description',
              'message': '请输入项目描述：',
              'default': ''
          }, {
            'type': 'list',
            'message': '项目下载完成后，是否为您执行 `cd projectName` `npm install`',
            'name':'autoInstall',
            'choices':['Yes,use NPM','Yes, use Yarn',' No, I will handle that myself '],
            'default':'No, I will handle that myself'
          }
      ]
    },


    /**
     * @description: 
     * @param {*}
     * @return {*}
     */
    getIsAutoInstall:async ()=>{
      return list = [
        {
          'type': 'list',
          'message': '是否进入项目，并且自动下载依赖？',
          'name':'autoInstall',
          'choices':['y','no'],
          'default':'y'
        }
      ]
    },


    /**
     * 获取是否覆盖提问列表
     */
    getCoverList : async () => {
      return [{
          'type': 'list',
          'name': 'isCover',
          'message': '是否覆盖已有项目？',
          'choices': ['y', 'n'],
          'default': 'y',
          'pageSize': 1000
      }]
    },


    /**
     * 检查create-lym-app线上版本
     */
    checkVersion: async () => {
        let spinner = ora().start();
        spinner.color = 'red';
        spinner.text = '正在检查线上 create-lym-app 包版本号.....'

        let packageInfo = await axios.get(createLymApp_NPM_REGISTRY);

        spinner.stop();
        if (packageInfo) {
            let lastVersion = packageInfo.data['dist-tags'].latest;

            Log.info(`当前 create-lym-app 最新版本号为 ${lastVersion},请及时更新`)
            Log.info('欢迎使用 create-lym-app 前端解决方案,作者LinYongMing，欢迎咨询')
            Log.space(2)
        } else {}
    },


    /**
     * 获取Git配置
     */
    getGitConfig:async ()=>{
      let gitInfo = {
          author: 'yourname',
          email: 'yourname@qq.com'
      };
      try {
          let author = await execSync('git config --get user.name');
          let email = await execSync('git config --get user.email');

          gitInfo = {
              author: author && author.toString().trim(),
              email: email && email.toString().trim()
          }
      } catch (e) {
          LOG.warn('警告：获取Git配置异常，请检查是否安装了Git')
      }

      return gitInfo;
    },


    /**
     * 检查是否支持命令
     */
    hasCommand: async (commandName) => {
        return shell.which(commandName)
    },


    /**
     * 检查是否联网
     */
    isOnline: async () => {
        return new Promise((resolve, reject) => {
            dns.lookup('www.baidu.com', (err, address, family) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            })
        })
    },


    /**
     * 判断指定路径是否存在
     */
    fsExists: async path => {
        return await fs.existsSync(path)
    },


    /**
     * 删除指定路径文件
     */
    deleteFiles: async path => {
        deleteFiles(path);
    },


    /**
     * 复制指定文件目录
     */
    copyFiles: async (fromPath, toPath) => {
        try {
            if (!fs.existsSync(toPath)) {
                await fs.mkdirSync(toPath)
            }

            return await efs.copySync(fromPath, toPath)
        } catch (e) {
            throw new Error(e);
        }
    },


    /**
     * @description: 检测是否存在create-lym-app
     * @param {*}
     * @return {*}
     */ 
    localBinExists:()=> {
      const localBinPathSegments = [process.cwd(), 'node_modules', '@lym', 'create-lym-app'];
      return existsSync(join(...localBinPathSegments));
    },

}

module.exports = tools