
const inquirer  = require('inquirer')
const   {LYM_TEMPLATE_ADMIN_GIT,LYM_TEMPLATE_MOBILE_GIT,LYM_TEMPLATE_PLUGIN_GIT,LYM_TEMPLATE_CONPOMENT_GIT}   = require('../common/constant') 
const ora = require('ora'); 
const { exec } = require('mz/child_process');
const Log = require('../common/log');
const {hasCommand,fsExists,copyFiles,getIsAutoInstall,getQuestionList,getCoverList,deleteFiles,mergePackageJson} = require('../common/util')
class init{
  constructor(){
    this.logInfo()
    this.templateName = '';
    this.projectName = '';
    this.packageConfig = {};
    this.spinner = ora();
    this.init()
    /**
     * 模版先下载到临时目录
     */
    this.tempPath = '.temp';
  }

  async init () {
    let gitInstalled = await hasCommand('git');
    if (gitInstalled) {
        // checkVersion().then(() => {
        //     this.downProjectFromGit();
        // })
        this.downProjectFromGit();
    } else {
        Log.error('错误提示：本机没有安装 Git 不能初始化项目')
    }
   }

    /**
     * 获取问题列表
     */
    async prompQuestions () {
      const QUESTION_LIST = await getQuestionList();
      return await inquirer.prompt(QUESTION_LIST);
  }
     /**
     * 获取是否自动下载依赖
     */
    async prompAutoInstall () {
      const QUESTION_LIST = await getIsAutoInstall();
      return await inquirer.prompt(QUESTION_LIST);
  }
    /**
     * 从Git服务器上拉取模版
     */
    async downProjectFromGit () {
      let anwers = await this.prompQuestions();
      if (anwers && anwers.templateName) {
          Log.space(2);

          this.templateName = anwers.templateName;
          this.projectName = anwers.name;
          delete anwers['templateName'];
          this.packageConfig = anwers;
          
          /**
           * 如果当前目录下存在项目，则提示是否覆盖
           */
          let exists = await fsExists(`./${this.projectName}`);
          if (exists) {
              let coverAnswer = await this.prompCover();
              if (coverAnswer && coverAnswer.isCover === 'y') {
                  await deleteFiles(`./${this.projectName}`)
              } else {
                  this.projectName = anwers.name + '-bak'
              }
          }

          this.spinner = ora({
              spinner: 'dots',
              text: `开始下载 ${this.templateName} 框架模版，请耐心等待......`
          });
          this.spinner.start();
          let sourceURL ;
          switch (this.templateName.toLowerCase()) {
            case 'admin':
              sourceURL = LYM_TEMPLATE_ADMIN_GIT
              break;
            case 'mobile':
               sourceURL = LYM_TEMPLATE_MOBILE_GIT
              break;
            case 'Plugin':
               sourceURL = LYM_TEMPLATE_PLUGIN_GIT
              break;
            case 'Component':
               sourceURL = LYM_TEMPLATE_COMPONENT_GIT
              break;
            default:
               sourceURL = LYM_TEMPLATE_ADMIN_GIT
              break;
          }
          if (sourceURL) {
              try {
                fsExists(this.tempPath) && deleteFiles(this.tempPath)
                let result = await exec(`git clone ${sourceURL} ${this.tempPath} --progress`);
                if (result) {
                    /**
                     * 模版拷贝到真正目录
                     */
                    await copyFiles(this.tempPath, this.projectName);
                    /**
                     * 删除临时目录
                     */
                    await deleteFiles(this.tempPath);
                    /**
                     * 回填package.json信息
                     */
                    await this.mergePackageInfo();
                    this.spinner.stop();
                    Log.info('Successfully created project '+this.projectName);
                    try {
                      if ( anwers.autoInstall){
                          this.spinner = ora({
                            spinner: 'dots',
                            text: `开始下载依赖，请耐心等待......`
                          }); 
                          if(anwers.autoInstall.indexOf('NPM') !== -1){
                            Log.space(2);
                            this.spinner.start()
                            await exec(`cd ${this.projectName} && npm install`)
                            Log.info('依赖下载完成，进入项目并启动项目吧')
                            this.spinner.stop()

                          }else if(anwers.autoInstall.indexOf('YARN') !== -1){
                            Log.space(2);
                            this.spinner.start()
                            await exec(`cd ${this.projectName} && yarn install`)
                            Log.info('依赖下载完成，进入项目并启动项目吧')
                            this.spinner.stop()
                          }else{
                            Log.space(2);
                            Log.error('依赖下载失败，请自行下载');
                            Log.info('cd '+this.projectName+'\n npm install 或 yarn install');
                          }
                      }else{
                        Log.error('依赖下载失败，请自行下载');
                        Log.info('cd '+this.projectName+'\n npm install 或 yarn install');
                      }
                     } catch (error) {
                      console.log(error)
                      Log.error('依赖下载失败，请自行下载');
                      Log.info('cd'+this.projectName+'\n npm install 或 yarn install');
                     }
                  }
              } catch (e) {
                console.error(e)
                  this.spinner.stop();
                  Log.error('错误提示：模版下载失败，联系开发者 LinYongMing（961998264@qq.com）')
              }
          } else {
              Log.error('错误提示：模版仓库地址获取失败')
              this.spinner.stop()
          }
      } else {
          Log.error('错误提示：模版信息获取异常')
          this.spinner.stop()
      }
  }
  /**
   * 回填用户init时填的参数
   */
    async mergePackageInfo () {
      return await mergePackageJson(process.cwd(), this.projectName, this.packageConfig)
  }
  /**
   * 是否覆盖原有项目
   */
  async prompCover () {
    const COVER_LIST = await getCoverList();
    return await inquirer.prompt(COVER_LIST);
  }

  /**
   * @description: 打印信息
   */
  async logInfo(){
    Log.info('项目初始化，可选择插件模版、组件模版、PC项目模版和H5模版，默认PC')
  }
}
module.exports = new init()