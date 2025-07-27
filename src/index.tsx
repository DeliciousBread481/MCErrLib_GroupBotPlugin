import { Context, Schema,h, sleep } from 'koishi'
import {} from 'koishi-plugin-markdown-to-image-service';
import GroupHandler from './GroupHandler/_index'
import PostHandler from './PostHandler/_index'
import TextHandler from './JSONHandler/_index';

let boolban = undefined;
let boolchecknotice = false;
let boolcursendcheck = false;
let boolhello = false;
let boolnotice = false;
let boolreminder = false;
let boolrecheckfile = 0;
let filenum = 0;

export const inject = {
  required: ['markdownToImage','database'],
}

declare module 'koishi' {
  interface Tables {
    File: Schedule
    GroupBan: Schedule
  }
}

export const name = 'mcgroupbot';

export interface Schedule {
  id: number
  fileId: string
  fileName: string
}

export interface Schedule {
  id: number
  boolstatus: string
  time: number
}

export interface Config {
  groupId: string;//报错群默认QQ群号
  welcome: string;//欢迎词
  goodbye: string;//告别词
  foldernum: number;//文件夹数量
  notice: string;//群公告
  op: Array<object>;//管理员QQ号
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    groupId: Schema.string().description("报错群默认QQ群号"),
  }).description("群号ID"),
  Schema.object({
    welcome: Schema.string().role('textarea').description("欢迎词"),
    goodbye: Schema.string().role('textarea').description("告别词"),
  }).description("群员加入或退出群聊的提醒词"),
  Schema.object({
    notice: Schema.string().role('textarea').description("群公告"),
  }).description("群公告"),
  Schema.object({
    foldernum: Schema.number().description("文件夹数量"),
  }).description("群文件文件夹数量 防止获取群文件的时候出现获取不足的情况"),
  Schema.object({
    op: Schema.array(Schema.object({
      Id: Schema.string().description("QQ号"),
      Level: Schema.number().description("权限等级"),
    })),
  }).description("管理员列表\n权限等级：1-普通管理员，2-高级管理员")
])

export function apply(ctx: Context,config: Config) {
  console.log("面包の报错群插件已启用");

  ctx.model.extend('File',{
    id: 'unsigned',
    fileId: 'string',
    fileName: 'string',
  })

  ctx.model.extend('GroupBan',{
    id: 'unsigned',
    boolstatus: 'string',
    time: 'unsigned',
  })

  async function checkBanData() {
    //console.log(await ctx.database.get('GroupBan',0))
    if((await ctx.database.get('GroupBan',0)).length == 0){
      ctx.database.create('GroupBan', {
        id: 0,
        boolstatus: 'false',
        time: 0
      })
    }
  }
  checkBanData();



  async function checkbool() {//定时检查切换开关
    boolchecknotice = true;
  }
  setInterval(checkbool,1000*60*10);


  async function getTime() {
  //let state = 0;
    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    if(hours == 7){
      return 1;//早上
    }else if(hours == 23 && minutes >= 30 || hours >= 0 && hours < 7){
      return 0;
    }
  }


  /*
  ctx.middleware(async (session,next) => {
    if(session.content != "0"){
      console.log(await GroupHandler.gop.checkOp(session,config));
    }
  })
    */

  /*
  ctx.on('message',(session) => {
    if(session.content != "0"){
      console.log(config);
      console.log((config as any).groupId);
    }
  })
    */
  ctx.middleware(async (session,next) => {
    if(session.channelId == config.groupId){
      return next();
    }
  })

  ctx.middleware(async (session,next) => {//检查群公告是否存在并自动补发
    //console.log(session);
    if(session.channelId == config.groupId)
    if(boolchecknotice){
      boolchecknotice = false;
      const getdata = await PostHandler.postcat.checkNotices(session);
      const senderId = await TextHandler.jarr.findValue("sender_id",getdata);
      console.log(getdata);

      if(senderId.includes(`${session.selfId}`)){
        return next();
      }else{
        await GroupHandler.gnotices.sendNotice(session,config);
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {
    console.log(session.content);
    if(session.content == "测试2"){
      const getdata = await PostHandler.postcat.checkNotices(session);
      const senderId = await TextHandler.jarr.findValue("sender_id",getdata);
      console.log(getdata);
      console.log(await PostHandler.postcat.checkGroupBan(session.channelId))
    }else{
      return next();
    }
  })

  async function getCurrentTime(){
    let currentDate = new Date();
    let month = currentDate.getMonth() + 1;
    let date = currentDate.getDate();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    return parseInt(`${month}`+`${date}`+`${hours}`+`${minutes}`);
  }

  async function CurfewHandler(config: Config){//宵禁处理
    const groupId = await config.groupId;
    async function checkGroupBan() {
      //console.log(await ctx.database.get("GroupBan",0)[0])
      const temp = await ctx.database.get("GroupBan",0);
      if(temp[0].boolstatus == "true"){
        return true;
      }else if(temp[0].boolstatus == "false"){
        return false;
      }
      /*
      if(await getCurrentTime() >= await ctx.database.get("GroupBan",0)[0].time){

      }
      */
    }
    boolban = await checkGroupBan();
    if(boolban){
      if(await getTime() == 1){//宵禁-早上
        boolhello = true;
        await GroupHandler.gcurfew.Curfew(groupId,boolban);
        await GroupHandler.gmsg.sendGroupMsg(groupId,"早上好呀，米娜！今天也要开心喔！");
        await ctx.database.set("GroupBan",0,{boolstatus:"false"});
      }else if(await getTime() == 0){//宵禁-晚上
        boolhello = false;
        boolnotice = false;
      }
    }else if(!boolban){
      //console.log(boolhello);
      //console.log(await getTime());
      if(await getTime() == 1 && boolhello == false){//未宵禁-早上
        //await GroupHandler.gcurfew.Curfew(groupId,boolban);
        await GroupHandler.gmsg.sendGroupMsg(groupId,"早上好呀，米娜！今天也要开心喔！");
        boolhello = true;
      }else if(await getTime() == 0 && boolnotice == false){
        await GroupHandler.gmsg.sendGroupMsg(groupId,"已经很晚咯，米娜记得早点睡喔，马上就要宵禁了");
        boolnotice = true;
      }
    }

    //console.log(config.groupId);

    //console.log(config.groupId)
  }
  setInterval(() => CurfewHandler(config),1000*5);

  ctx.on("guild-member-added",async(session) => {//入群欢迎
    if(session.channelId == config.groupId){
      //const temp = await ctx.database.get("GroupBan",0);
      //console.log(temp[0])
      boolban = await ctx.database.get("GroupBan",0);
      boolban = boolban[0].boolstatus;
      const addId = await session.event.user.id;
      await session.send(<><at id={addId}/><br />{config.welcome}</>)
      if(boolban == "true"){
        await session.send(<><at id={addId}/><br />现在已经宵禁了喔 请明天早上再来吧~ 晚安捏</>);
      }
    }

  })

  ctx.on("guild-member-removed",async(session) => {//退群送别
    if(session.channelId == config.groupId){
      const removeId = await session.event.user.id;
      session.send(<><at id={removeId}/><br />{config.goodbye}</>)
    }

  })

  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 1){
      if(session.content.includes("群公告")){
        if(session.elements.length > 1){
          const msgobj = await GroupHandler.gmsg.handleAtMsg(session);
          if(msgobj.content == " 群公告" || msgobj.content == "群公告"){
            const groupId = session.channelId;
          //console.log(groupId,msgobj.atId);
            await GroupHandler.gban.banUser(groupId,msgobj.atId);
            session.send(
            "回去重新 仔细！认真！阅读群公告\n群公告哪里没写清楚指出来\n为确保你能安静独自仔细阅读 现禁言你3分钟作处理\n\n如有误会请私信对你发送禁言关键词的人\n\n如果你想退群我也不拦着你 就当你不想解决问题 你没有认真阅读群公告配合我们和忍耐3分钟禁言的决心 那么你也没有解决问题的决心\n\n哦对了 如果置顶群公告不见了就和管理私信说一下");
            return next();
          }else{
            return next();
          }
        }else if(session.elements.length == 1){
          const msgobj = await GroupHandler.gmsg.handleMsg(session);
          if(msgobj.type == "at"){
            return next();
          }else if(msgobj.type == "text"){
            console.log(msgobj.content.content);
            if(msgobj.content.content == " 群公告" || msgobj.content.content == "群公告"){
              await GroupHandler.gmsg.sendGroupMsg(session.channelId,"请指定要艾特的人喔");
              return next();
            }
          }
        }
      }else{
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 1){

      if(session.content == "宵禁"){
        const groupId = session.channelId;
        if(await getTime() != 0){
          await session.send("还没到宵禁时间喔，确定要宵禁嘛\n回答： 确定/取消");
          boolcursendcheck = true;
          return next();
        }else{
          await GroupHandler.gcurfew.Curfew(groupId,false);
          await ctx.database.set("GroupBan",0,{boolstatus:"true",time:await getCurrentTime()});
        }
      }else{
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 1){
      if(boolcursendcheck){
        if(session.content == "确定"){
          const groupId = session.channelId;
          await GroupHandler.gcurfew.Curfew(groupId,false);
          await ctx.database.set("GroupBan",0,{boolstatus:"true",time:await getCurrentTime()});
          boolcursendcheck = false;
          return next();
        }else if(session.content == "取消"){
          boolcursendcheck = false;
          await session.send("好哦 一会儿再叫我喔~");
          return next();
        }
      }else{
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 1){
      if(session.content == "解禁"){
        const groupId = session.channelId;
        await GroupHandler.gcurfew.Curfew(groupId,true);
        await ctx.database.set("GroupBan",0,{boolstatus:"false"})
      }else{
        return next();
      }
    }else{
      return next();
    }
  })


  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 2){
      const regex1dgt = /获取群文件\s--\d/;
      const regex2dgt = /获取群文件\s--\d\d/;
      if(regex1dgt.test(session.content) || regex2dgt.test(session.content)){
        const pos = session.content.indexOf("--");
        let num = parseInt(session.content.substring(pos+2));
        const FileArray = await GroupHandler.gfile.getGroupFiles(session,num+config.foldernum);
        if(FileArray.length < num){
          num = FileArray.length;
          await session.send("抱歉捏 群文件没有那么多喔 已经把有的都存数据库啦~");
        }
        //console.log(FileArray);
        let boolsenderr = false;
        for(let i = 0;i<num;i++){
          //console.log(FileArray[i]);
          try{
            await ctx.database.create('File' , {
              id: i,
              ...FileArray[i]
            })
          }catch(e){
            console.log(e);
            if(!boolsenderr){
              session.send("抱歉捏 存储数据库失败了");
              boolsenderr = true;
            }
          }
        }
      }else{
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {//收到文件信息 存储数据库
    filenum++;
    let ccurrentDate = new Date();
    let month = ccurrentDate.getMonth() + 1;
    let date = ccurrentDate.getDate();
    let timestr;
    //console.log(typeof month);
    //timestr  = `${month}`+`${date}`+`-${filenum}`;
    //console.log(filenum);


    //console.log(timestr);
    if(session.elements[0].type == "file"){
      if(filenum < 10){
        timestr  = `${month}`+`${date}`+"00"+`${filenum}`;
        //console.log(`${month}`+`${date}`+"00"+`${filenum}`);
        //console.log(timestr);
      }else if(filenum >=10 && filenum < 100){
        timestr  = `${month}`+`${date}`+"0"+`${filenum}`;
      }else{
        timestr  = `${month}`+`${date}`+`${filenum}`;
      }
      //console.log(timestr);
      const filearr = await GroupHandler.gfile.getGroupFiles(session,1+config.foldernum);
      const fileobj = filearr[0];
      await PostHandler.postfile.downloadFile(session,fileobj.fileId,fileobj.fileName);
      await PostHandler.postfile.PostFileInfo(fileobj.fileName);
      console.log(fileobj);
      await ctx.database.create('File', {
        id: parseInt(timestr),
        ...fileobj
      });
    }else{
      return next();
    }
  })

/*
  ctx.middleware(async (session,next) => {
    //console.log(session.content);
    if(session.content == "清空数据库"){
      await session.send("收到喵 请自行去后台检查捏");
      await ctx.database.remove('File' ,{
        id: { $gt: 0, $lte: 12123180 },
      })
    }else{
      return next();
    }
  })
*/

  ctx.middleware(async (session,next) => {//清理群文件
    if(await GroupHandler.gop.checkOp(session,config) >= 2){
      let ccurrentDate = new Date();
      let month = ccurrentDate.getMonth() + 1;
      let date = ccurrentDate.getDate();
      let timestr  = `${month}`+`${date}`;

      const regex1dgt = /清理群文件\s--\d/;
      const regex2dgt = /清理群文件\s--\d\d/;
      if(regex1dgt.test(session.content) || regex2dgt.test(session.content)){
        const pos = session.content.indexOf("--");
        let num = parseInt(session.content.substring(pos+2));
        let fileArray = [];
        timestr += "000";
        //console.log(parseInt(timestr));

        fileArray = await ctx.database.get('File', {
          id: { $lt: parseInt(timestr) }
        });
        console.log(timestr);
        console.log(fileArray);
        let markdowwn = "| 主键ID | 文件名 |";
        markdowwn += "\n| --- | --- |";
        if(fileArray.length == 0){
          session.send("抱歉喔 现在存储的满足条件的文件数据数为0 请明天再来清除吧 如果有异常就请手动清除吧 抱歉qwq");
          return next();
        }else if(fileArray.length < num){
          num = fileArray.length;
          session.send("抱歉喔 数据库存储的满足条件的文件数据信息数量到不了你指定的数量喔");
          session.send("不过现在正在尝试清理已满足条件的文件 不要急喔~");
        }
        for(let i = 0;i < num;i++){
          markdowwn += `\n| ${fileArray[i].id} | ${fileArray[i].fileName} |`;
        }
        let imagebuffer;
        try{
          imagebuffer = await ctx.markdownToImage.convertToImage(markdowwn);
        }catch(e){
          session.send("抱歉喔 图片渲染出了问题 可以再试一次哦");
          console.log(e);
          return next();
        }
        //console.log(imagebuffer.toString('base64'));
        await session.send(<>请检查是否要清理以下文件 请发送“确定”或“取消”来进行下一步<br /><img src={'data:image/png;base64,' + imagebuffer.toString('base64')} /></>);
        boolrecheckfile = 0;
        while(boolrecheckfile == 0){
          await sleep(1000);
        }
        if(boolrecheckfile == 1){
          //const FileArray = fileArray;
          console.log(fileArray)
          const IdArray = [];
          for(let i = 0;i<num;i++){
            console.log(fileArray[i].id);
            IdArray.push(fileArray[i].id);
          }
          //console.log(IdArray);
          //await ctx.database.remove('schedule', IdArray)
          const imageBuffer = await ctx.markdownToImage.convertToImage(await GroupHandler.gfile.removeGroupFile(session,num,fileArray));
          //console.log(imageBuffer);
          await ctx.database.remove('File', IdArray)
          await session.send(<>已执行操作 状态图表如下：<br /><img src={'data:image/png;base64,' + imageBuffer.toString('base64')} />如果有失败操作 请确定原因并修复或手动删除 抱歉啦</>)
        }else if(boolrecheckfile == 2){
          session.send("已取消自动清理 有问题记得去修复喔");
          return next();
        }
      }else{
        return next();
      }
    }else{
      return next();
    }
  })

  ctx.middleware(async (session,next) => {
    if(await GroupHandler.gop.checkOp(session,config) >= 2){
      if(session.content == "取消"){
        if(boolrecheckfile == 0){
          boolrecheckfile = 2;
        }
      }else if(session.content == "确定"){
        if(boolrecheckfile == 0){
          boolrecheckfile = 1;
        }
      }
    }else{
      return next();
    }
  })





}
