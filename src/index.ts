import { Context,Schema,h } from 'koishi';
import axios from 'axios';
import FormData from 'form-data';
import {} from 'koishi-plugin-adapter-onebot';
import { WebSocket } from 'ws';

const PICUI_API_BASE_URL = "https://picui.cn/api/v1";
const PICUI_API_TOKEN = "Bearer 753|HUe6fDn57Qub1W8ZQ9Y3ckMB3miHDwtZOB8xQ8K5";

let ws = new WebSocket("ws://0.0.0.0:3001/");

export interface Config {
    setting: array;//问答库格式设置
    welcome: string;//欢迎词
    goodbye: string;//告别词
    notice: string;//群公告
}

export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      setting: Schema.array(String).default(['ques','ans']).description("以下为两个默认配置 『ques』和『ans』"),
    }).description('问答库格式设置'),
    Schema.object({
      welcome: Schema.string().role('textarea').description("欢迎词"),
      goodbye: Schema.string().role('textarea').description("告别词"),
    }).description("群员加入或退出群聊的提醒词"),
    Schema.object({
      notice: Schema.string().role('textarea').description("群公告"),
    }).description("群公告"),
])

import * as fs from 'fs';
fs.mkdirSync("../storage/storage.json", { recursive: true });
const path = require("path");

let storage: object = null;
let jsontemp: object = null;
let white: object = null;

fs.readFile(path.resolve(__dirname, "../storage/storage.json"), 'utf8', (err, storagejson) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    storage = JSON.parse(storagejson);
    //console.log(storagejson);
  } catch (e) {
    console.error(e);
  }
})
fs.readFile(path.resolve(__dirname, "../storage/jsontemp.json"), 'utf8', (err, jsontempjson) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    jsontemp = JSON.parse(jsontempjson);
    //console.log(storagejson);
  } catch (e) {
    console.error(e);
  }
});
fs.readFile(path.resolve(__dirname, "../storage/white.json"), 'utf8', (err, whitejson) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    white = JSON.parse(whitejson);
    //console.log(storagejson);
  } catch (e) {
    console.error(e);
  }
});
fs.readFile(path.resolve(__dirname, "../storage/filelist.json"), 'utf8', (err, filelistjson) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    filelist = JSON.parse(filelistjson);
    //console.log(storagejson);
  } catch (e) {
    console.error(e);
  }
});

export const name = 'mcelib'


let jsonmode: boolean = false;
let modegroupId: number = null;
let modeuserId: number = null;
let msgcontent: string = "";
let msgjson: object;
let userId: number;
let groupId: number;
let atqqId: string;
//let storagenum: number = 2;
let httperr: string;
let configarray: string[];
configarray = ["ques","ans"];
let msgjsonstr: string[];
msgjsonstr = [];
let geturlarr: string[] = [];
let jsonfilestr: string = "";
let boolans: boolean = false;
let ceshibool: boolean = false;
let boolhttperr: boolean = false;
let ansstr: string = "";
let boolkey: boolean;
let imagename: string;
let filenamearr: string[] = [];
let boolwhite: boolean = false;
let boolfile: boolean;
let boolban: boolean;
let boolnotice: boolean;
let remsgstr: string = "";
let replymsgidstr: string = "";
let replymsgid: number = 0;
let temp;
//let boolwhite: boolean = false;

export function apply(ctx: Context,config: Config) {
  
  boolwhite = false;
  console.info("面包报错库插件已启用");
  let setting = config.setting;
  let storageset: string[] = Object.values(setting);
  //console.log("setting "+storagese
  //getfileuploadevent();
  
  //回答指令注册
  ctx.command("问答库 <ques>","-快捷回复解决方案")
    .usage("\n用于自动快捷回复解决方案 请回复报错文件 或者 艾特对应的人 后 再输入此指令\n如果不艾特或不回复 发送的解决方案也不会艾特对应人员\n")
    .example("\n[回复消息] 。问答库 ticking\n@XXX 。问答库 ticking\n。问答库 ticking\n。问答库 -填入参数 -XX:+UseAdaptiveSizePolicy")
    .option("jvmarg","-填入参数 [jvmarg]","用于快捷回答如何填入参数 在『-填入参数』后添加所需参数即可")
    .option("cme","-CME <cmearg>","用于快捷回答\"CME is Bad\"模组的使用方法及参数")
    .action(async ({session,next,options},ques) => {
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      boolwhite = await parsewhite(msgjson);
      let argobj: object;
      let transstr1: string = "";
      let transstr2: string = "";
      let obj: object;
      let quesstr: string = "";
      let atstr: string = "";
      let replyqqId: number = null;
      let index1: number = 0;
      let index2: number = 0;
      let lastindex: number = 0
      let len: number = 0
      let i: number;
      let ansstr: string = "";
      let argtext: string = "";
      argobj = options;
      //console.log(msgcontent.includes("。问答库"))
      if(msgcontent.includes("。问答库")){
        //await readfilefun();
        //console.log(msgjson);
        if(msgcontent.includes("[CQ:reply,id=")){
          index1 = msgcontent.indexOf("[CQ:reply,id=")+13;
          index2 = msgcontent.indexOf("]",index1);
          replymsgidstr = msgcontent.substring(index1,index2);
          //console.log(replymsgidstr);
          replymsgid = parseInt(replymsgidstr);
          //console.log(replymsgid);
          obj = await session.onebot.getMsg(replymsgid);
          replyqqId = await obj.user_id;
          atstr = `[CQ:at,qq=${replyqqId}]\n`;
          //console.log(obj);
          //console.log(replyqqId);
          //replyqqId = await session.onebot.getMsg(replymsgid).sender.user_id;
          //console.log(replyqqId);
        }else if(msgcontent.includes("[CQ:at,qq=")){
          index1 = msgcontent.indexOf("[CQ:at,qq=")+10;
          index2 = msgcontent.indexOf("]",index1);
          replyqqId = msgcontent.substring(index1,index2);
          atstr = `[CQ:at,qq=${replyqqId}]\n`;
        }else{
          atstr = "";
        }
        //session.onebot.sendGroupMsg(groupId,"测试");
        //console.log(options);
        index1 = msgcontent.lastIndexOf(" ");
        if(argobj.jvmarg != null){
          ques = "-填入参数";
          argtext = argobj.jvmarg;
          //console.log(argtext);
          //console.log(ansstr);
        }
        if(argobj.cme != null){
          ques = "CME";
          argtext = argobj.cme;
        }
        quesstr = ques;
        //console.log(quesstr);
        len = storage.length;
        for(i=0;i<len;i++){
          if(quesstr == storage[i].ques){
            index1 = i;
            break;
          }
        }
        //console.log(quesstr);
        //console.log(index);
        //transstr1 = "\\"+"\/";
        transstr2 = "\/";
        ansstr = storage[index1].ans;
        ansstr = ansstr.replace(/\\+\//g,transstr2);
        //await console.log(ansstr.includes(transstr1));
        //console.log(ansstr+"\n"+transstr1+"\n"+transstr2);
        ansstr = atstr+ansstr;
        if(argobj.jvmarg != null){
          ansstr = ansstr+"\n"+argtext;
        }
        if(argobj.cme != null){
          ansstr = ansstr.replace("args",argtext);
        }
        session.onebot.sendGroupMsg(groupId,ansstr);
      }else{
        return next();
      }
    });
  
  //写入问答库指令注册
  ctx.command("写入问答库","-写入解决方案")
    .usage("\n输入指令『。写入问答库』后\n请按以下格式输入内容——\n\n『问题触发关键词』\n『回答』\n写入问答库完成后请务必使用『刷新文件』指令 以免出现意外\n")
    .example("\n第一步：\n。写入问答库\n第二步：\nticking\nticking对应解决方案")
    .action(async ({session,next},_) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    boolwhite = await parsewhite(msgjson);
    //console.log(msgcontent);
    //console.log(typeof jsontemp);
    if(msgcontent.match("。写入问答库")){
      if(userId == "3574467868"){
        session.onebot.sendGroupMsg(groupId,"已开启写入问答库模式 请按要求写入");
        jsonmode = true;
        modegroupId = groupId;
        modeuserId = userId;
      }else{
        session.onebot.sendGroupMsg(groupId,"检测到您为非开发者 如果你想提交问答库方案 请私信面包 后续将会开发审核功能");
      }
    }else{
      return next();
    }
  });
  
  //问答库列表指令注册
  ctx.command("问答库列表","-获取问题列表")
    .usage("\n输出问答库列表")
    .example("\n。问答库列表")
    .action(async ({session,next}) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    boolwhite = await parsewhite(msgjson);
    let len: number = 0;
    let i: number;
    let quesarr: string[] = [];
    let responsestr: string = "";
    if(msgcontent.includes("。问答库列表")){
      //console.log("测试");
      await readfilefun();
      len = storage.length;
      responsestr = "问答库问题列表：\n";
      for(i=0;i<len;i++){
        quesarr[i] = storage[i].ques;
        responsestr = responsestr+`${i+1}`+"."+quesarr[i]+"\n";
      }
      len = responsestr.length;
      responsestr = responsestr.substring(0,len-1);
      session.onebot.sendGroupMsg(groupId,responsestr);
    }else{
      return next();
    }
  });
  
  ctx.command("刷新文件","-重新读取文件")
    //.description("\n重新读取文件")
    //.option("\n重新读取文件")
    .usage("\n重新读取文件")
    .example("\n。刷新文件")
    .action(async ({session,next}) => {
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      boolwhite = await parsewhite(msgjson);
      if(msgcontent.includes("刷新文件")){
        await readfilefun();
        await session.onebot.sendGroupMsg(groupId,"已成功刷新文件读取")
      }else{
        return next();
      }
    })
  
  ctx.command("群公告","-禁言提醒看群公告")
    .usage("\n禁言对应群员 让他回去重新看群公告 默认禁言3分钟")
    .example("\n。群公告 @XXX\n[回复消息] 。群公告")
    .action(async ({session,next}) => {
      //console.log("测试");
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      boolwhite = await parsewhite(msgjson);
      let obj: object;
      let banId;
      console.log(msgcontent);
      if(msgcontent.includes("群公告")){
        if(msgcontent.includes("[CQ:at,qq=")){
          atqqId = await parseatqq(msgjson);
          banId = await atqqId;
          banId = parseInt(banId);
          console.log(typeof banId);
        }else if(msgcontent.includes("[CQ:reply,id=")){
          replymsgidstr = await parsermsgId(msgjson);
          replymsgid = parseInt(replymsgidstr);
          //console.log(replymsgidstr);
          obj = await session.onebot.getMsg(replymsgid);
          replyqqId = await obj.user_id;
          banId = await replyqqId;
          console.log(typeof banId);
        }else{
          session.onebot.sendGroupMsg(groupId,`[CQ:at,qq=${userId}] 抱歉，没有识别到你有艾特群员或回复消息捏`);
        }
        try{
          await session.onebot.setGroupBan(groupId,banId,180);
          await session.onebot.sendGroupMsg(groupId,`[CQ:at,qq=${banId}]\n回去重新 仔细！认真！阅读群公告\n群公告哪里没写清楚指出来\n为确保你能安静独自仔细阅读 现禁言你3分钟作处理\n\n如有误会请私信对你发送禁言关键词的人\n\n如果你想退群我也不拦着你 就当你不想解决问题 你没有认真阅读群公告配合我们和忍耐3分钟禁言的决心 那么你也没有解决问题的决心\n\n哦对了 如果置顶群公告不见了就和管理私信说一下`);
        }catch(error){
          console.log(error);
        }
      }else{
        return next();
      }
    })

  ctx.command("宵禁","-晚上全体禁言")
    .usage("\n进行宵禁操作 在晚上全体禁言")
    .example("\n。宵禁")
    .action(async ({session,next}) => {
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      boolwhite = await parsewhite(msgjson);
      if(!boolwhite){
        return next();
      }
      if(msgcontent.includes("宵禁")){
        await session.onebot.setGroupWholeBan(groupId,true);
        await session.onebot.sendGroupMsg(groupId,"本群现已宵禁 有能力解答的人已经睡觉觉咯 你也早点睡吧 将于07:00解除全体禁言 早点睡吧 早晨再来寻求帮助");
        temp = groupId;
        await console.log("开始宵禁");
        boolban = true;
        setTimeout(() => {
          session.onebot.setGroupWholeBan(groupId,false);
          console.log("宵禁解除")
          boolban = false;
        },21600000);
        
      }else{
        return next();
      }
    })
  
  ctx.command("补公告","-用于补发被吞公告")
    .usage("\n补发被吞的群公告")
    .example("\n。补公告")
    .action(async ({session,next}) => {
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      boolwhite = await parsewhite(msgjson);
      let notice: string;
      notice = config.notice;
      if(!boolwhite){
        return next();
      }
      if(groupId == "958853931"){
        await session.onebot.sendGroupNotice(groupId,notice);
      }else{
        await session.onebot.sendGroupMsg(groupId,"此功能仅支持在MC疑难杂症交流群使用");
      }
    })
  
  ctx.command("清理群文件","-快捷清理文件")
    .usage("\n群文件满后 快捷清理古早文件")
    .example("\n。清理群文件")
    .action(async ({session,next}) => {
      msgjson = await session.onebot.getMsg(session.messageId);
      msgcontent = await msgjson.raw_message;
      userId = await msgjson.user_id;
      groupId = await msgjson.group_id;
      if(msgcontent.includes("清理群文件")){
        let len: number;
        let i: number;
        let Idarr;
        try{
          Idarr = await filedelId();
          len = Idarr.length;
          //console.log(len);
          len = parseInt(Idarr[len-1]);
          for(i=0;i<len;i++){
          
            data = JSON.stringify({
              "group_id":groupId,
              "file_id":Idarr[i]
            });
          
            //console.log(data);
          
            postconfig = {
              method: 'post',
              url: 'http://0.0.0.0:3000/delete_group_file',
              headers: {
                'Content-Type': 'application/json'
              },
              data : data
            }
        
            axios(postconfig)
            .then(async function (response) {
              await console.log(response.data);
            })
            .catch(function (error) {
              console.log(error);
            });
          }
          await session.onebot.sendGroupMsg(groupId,`已成功清理群文件 本次清理了${i}件`);
        }catch(err){
          session.onebot.sendGroupMsg(groupId,"清理失败 暂无古早文件可清理");
          console.log(err);
        }
      }else{
        return next();
      }
    })
  
  ctx.on("guild-member-added",async(session) => {
    //console.log(session);
    let addId;
    let groupId;
    let msg;
    let welcome
    groupId = await session.event.channel.id;
    if(groupId == "958853931"){
      groupId = parseInt(groupId);
      addId = await session.event.user.id;
      msg = `[CQ:at,qq=${addId}]`;
      welcome = await config.welcome;
      msg = msg+"\n"+welcome;
      //console.log(typeof groupId);
      await session.onebot.sendGroupMsg(groupId,msg);
      if(boolban){
        await session.onebot.sendGroupMsg(groupId,"本群现已宵禁 有能力解答的人已经睡觉觉咯 你也早点睡吧 将于07:00解除全体禁言 早点睡吧 早晨再来寻求帮助");
      }
    }
    
  })
  
  ctx.on("guild-member-removed",async(session) => {
    //console.log(session);
    let removeId;
    let groupId;
    let msg;
    let goodbye
    groupId = await session.event.channel.id;
    if(groupId == "958853931"){
      groupId = parseInt(groupId);
      removeId = await session.event.user.id;
      msg = `[CQ:at,qq=${removeId}]`;
      goodbye = await config.goodbye;
      msg = msg+"\n"+goodbye;
      //console.log(typeof groupId);
      await session.onebot.sendGroupMsg(groupId,msg);
    }
  })
  
  //白名单判断中间件
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id; 
    boolwhite = false;
    boolwhite = await parsewhite(msgjson);
    //await console.log("白名单"+boolwhite);
    if(boolwhite){
      //console.log(msgjson);
      return next();
    }
  },true)
  
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let notice = config.notice;
    if(msgcontent != null){
      //console.log(notice.length);
      if(groupId == "958853931"){
        let noticeobj = await session.onebot.getGroupNotice(groupId);
        let len = noticeobj.length;
        if(len == 0){
          await session.onebot.sendGroupMsg(groupId,"检测到群公告疑似被吞 现重新补发");
          await session.onebot.sendGroupNotice(groupId,notice);
        }else{
          return next();
        }
      }else{
        return next();
      }
    }
  })
  
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let imagenamearr: string[] = [];
    //let imagename: object;
    let setting = await config.setting[0];
    //let len: number;
    //let i: number;
    //let pathsonstr: string;
    let imageUrl: string;
    if(msgcontent.includes("代码测试") && boolwhite == true){
      temp = await session.onebot.getGroupNotice(groupId);
      console.log(temp);
    }else{
      return next();
    }
  })
  
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    //console.log;
    let imagenamearr: string[] = [];
    //let imagename: object;
    let setting = await config.setting[0];
    //let len: number;
    //let i: number;
    //let pathsonstr: string;
    //console.log(msgjson);
    let imageUrl: string;
    if(msgcontent.includes("[CQ:file,file=") && groupId == "958853931"){
      //console.log(msgjson);
      await getGroupRootFiles();
      console.log("检测到文件上传");
      //getfileuploadevent();
    }else{
      return next();
    }
  })
  
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    //console.log(msgjson);
    if(msgjson.raw_message.includes("报错测试") == true && msgjson.raw_message.includes("reply,id") == true) {
      let msgId: string = await parsermsgId(msgjson);
      //console.log(`[CQ:reply,id=${msgId}]`)
      session.onebot.sendGroupMsg(msgjson.group_id,`[CQ:reply,id=${msgId}]`+"报错回复测试");
    }else{
      return next();
    }
  })
      
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    if(msgcontent.includes("[CQ:at,qq=") && msgcontent.includes("。报错库")){
      await doans(msgjson);
        if(boolkey){
          atqqId = await parseatqq(msgjson);
            let atstr: string = "[CQ:at,qq="+atqqId+"]";
            ansstr = atstr+"\n"+ansstr;
            session.onebot.sendGroupMsg(groupId,ansstr);
        }else{
          let atstr: string = "[CQ:at,qq="+userId+"]";
          ansstr = atstr+"\n"+ansstr;
          session.onebot.sendGroupMsg(groupId,ansstr);
        }
    }else{
      return next();
    }
  }) 
      
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    if(ceshibool){
      //console.log("测试");
      await doans(msgjson);
    }else{
      return next();
    }
  })
      
  /*
  //触发写入问答库模式
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    //console.log(msgcontent);
    //console.log(typeof jsontemp);
    if(msgcontent.match("。写入问答库")){
      session.onebot.sendGroupMsg(groupId,"已开启写入问答库模式 请按要求写入");
      jsonmode = true;
      modegroupId = groupId;
      modeuserId = userId;
    }else{
      return next();
    }
  })
  */
      
  //写入问答库模式
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    //console.log(typeof setting);
    //console.log(storageset.length);
    if(jsonmode === true && modeuserId === userId && modegroupId === groupId){
      await readfilefun();
      msgcontent = msgcontent.replace(/\//g,"\\\/");
      //msgcontent = msgcontent.replace(/\\\/g,"\\");
      //console.log(msgcontent);
      let regex = /取消/gi;
      let index: number = 0;
      if(regex.test(msgcontent)){
        await session.onebot.sendGroupMsg(groupId,"已取消写入问答库模式");
        jsonmode = false;
        return next();
      }else{
        if(msgcontent.includes("\[CQ:image")){
          let i: number;
          let len: number;// = filenamearr.length;
          let num: number = 0;
          let urlarr: string[] = [];
          let imageUrlarr: string[] = [];
          let cqarr: string[] = [];
          let cqstr: string = "";
          let filenamearr: string[] = [];
          let quesstr: string = "";
          let ceshiarr: string[] = [];
          //console.log(msgcontent);
          index = msgcontent.indexOf("\n");
          quesstr = msgcontent.substring(0,index);
          index = 0;
          //len = msgcontent.length;
          //console.log("判断测试");
          /*
          for(i=0;i<len;i++){
            if(msgcontent.includes("\[CQ:image",index) == -1){
              num = i-1;
              break;
            }else{
              index = msgcontent.includes("\[CQ:image",index);
              index++
            }
          }
          */
          cqarr = await parsecq(msgcontent);
          //console.log(cqarr);
          urlarr = await parseimagesrc(session.elements);
          filenamearr = await parseimagename(msgjson);
          len = urlarr.length;
          //let lenson: number = 0;
          //let j: number = 0;
          let filename: string = "";
          let returnobj;
          for(i=0;i<len;i++){
            filename = quesstr+`${i+1}`;
            returnobj = await judgeImageUpload(filename);
            //console.log(returnobj);
            if(returnobj.boolexist_inter){
              let position = returnobj.index_inter;
              urlstr = await returnobj.urlarr_inter[position];
              urlstr = "\[CQ:image,file="+urlstr+"\]";
              //continue;
            }else{
              imageUrlarr[i] = await uploadQQImageToPICUI(urlarr[i],filename);
              urlstr = imageUrlarr[i];
              urlstr = await reconfigCQ(imageUrlarr[i]);
            }
            //imageUrlarr[i] = await uploadImageFromURL(urlarr[i],filenamearr[i]);
            //await console.log("cq码数组："+cqarr[i]);
            
            cqstr = cqarr[i];
            //await console.log(imageUrlarr[i]);
            //const [img] = h.select(session.elements, 'img');
            //const qqimageUrl = img.attrs.src;
            //urlarr = 
            //console.log(urlarr);
            //lenson = urlarr.length;
            //console.log(typeof img);
            //console.log(session.elements);
            //ceshiarr = qqimageUrl;
            //console.log(qqimageUrl);
            //console.log(qqimageUrl.includes("\n"));
            //**imageUrlarr[i] = await uploadQQImageToPICUI(urlarr[i],filename);
            //console.log(imageUrlarr);
            //**urlstr = imageUrlarr[i];
            //console.log(typeof urlstr);
            //**urlstr = await reconfigCQ(imageUrlarr[i]);
            msgcontent =  msgcontent.replace(cqstr,urlstr);
            //console.log(cqstr);
            //console.log(msgcontent);
            //await console.log(msgcontent.includes(cqstr));
            //console.log("这对吗？："+msgcontent);
            
          }
        }
        try{
          await parsejsonmsg(msgjson,msgcontent,storageset);
          jsonmode = await false;
          modegroupId = modeuserId = await null;
          if(boolhttperr){
            await session.onebot.sendGroupMsg(groupId,"图片上传图床失败\n错误状态码："+httperr);//+"\n文件仍会写入但图片CQ码都会被替换为null");
            httperr = "";
            boolhttperr = false;
          }else{
            await session.onebot.sendGroupMsg(groupId,"已成功写入");
          }
          if(boolfile){
            console.log("备份成功");
          }else{
            await session.onebot.sendGroupMsg(groupId,"原文件有错误 新回答内容覆写全部文件 旧内容依旧存在备份里 请前去检查\n否则下一次写入问答库将会重置备份");
          }
        }catch(err){
          //console.log("测试报错")
          jsonmode = await false;
          session.onebot.sendGroupMsg(groupId,errorstr(err));
        }
      }
    }else{
      return next();
    }
  })
  
  /*
  //问答库列表输出
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let len: number = 0;
    let i: number;
    let quesarr: string[] = [];
    let responsestr: string = "";
    if(msgcontent.includes("。问答库列表")){
      await readfilefun();
      len = storage.length;
      responsestr = "问答库问题列表：\n";
      for(i=0;i<len;i++){
        quesarr[i] = storage[i].ques;
        responsestr = responsestr+`${i+1}`+"."+quesarr[i]+"\n";
      }
      len = responsestr.length;
      responsestr = responsestr.substring(0,len-1);
      session.onebot.sendGroupMsg(groupId,responsestr);
    }else{
      return next();
    }
  })
  */
  
  /*
  //触发回答
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let transstr1: string = "";
    let transstr2: string = "";
    let obj: object;
    let quesstr: string = "";
    let atstr: string = "";
    let replymsgidstr: string = "";
    let replymsgid: number = 0;
    let replyqqId: number = null;
    let index1: number = 0;
    let index2: number = 0;
    let lastindex: number = 0
    let len: number = 0
    let i: number;
    let ansstr: string = "";
    //console.log(msgcontent.includes("。问答库"))
    if(msgcontent.includes("。问答库")){
      await readfilefun();
      //console.log(msgjson);
      if(msgcontent.includes("[CQ:reply,id=")){
        index1 = msgcontent.indexOf("[CQ:reply,id=")+13;
        index2 = msgcontent.indexOf("]",index1);
        replymsgidstr = msgcontent.substring(index1,index2);
        //console.log(replymsgidstr);
        replymsgid = parseInt(replymsgidstr);
        //console.log(replymsgid);
        obj = await session.onebot.getMsg(replymsgid);
        replyqqId = await obj.user_id;
        atstr = `[CQ:at,qq=${replyqqId}]\n`;
        //console.log(obj);
        //console.log(replyqqId);
        //replyqqId = await session.onebot.getMsg(replymsgid).sender.user_id;
        //console.log(replyqqId);
      }else if(msgcontent.includes("[CQ:at,qq=")){
        index1 = msgcontent.indexOf("[CQ:at,qq=")+10;
        index2 = msgcontent.indexOf("]",index1);
        replyqqId = msgcontent.substring(index1,index2);
        atstr = `[CQ:at,qq=${replyqqId}]\n`;
      }else{
        atstr = "";
      }
      //session.onebot.sendGroupMsg(groupId,"测试");
      index1 = msgcontent.lastIndexOf(" ");
      quesstr = msgcontent.substring(index1+1);
      len = storage.length;
      for(i=0;i<len;i++){
        if(quesstr == storage[i].ques){
          index1 = i;
          break;
        }
      }
      //console.log(quesstr);
      //console.log(index);
      //transstr1 = "\\"+"\/";
      transstr2 = "\/";
      ansstr = storage[index1].ans;
      ansstr = ansstr.replace(/\\+\//g,transstr2);
      //await console.log(ansstr.includes(transstr1));
      //console.log(ansstr+"\n"+transstr1+"\n"+transstr2);
      ansstr = atstr+ansstr;
      session.onebot.sendGroupMsg(groupId,ansstr);
    }else{
      return next();
    }
  })
  */
  
  //消息拼接
  ctx.middleware(async (session,next) => {
    msgjson = await session.onebot.getMsg(session.messageId);
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let replymsgjson: object;
    if(msgcontent.includes("。执行消息拼接")){
      let replymsgIdstr = await parsermsgId(msgjson);
      let replymsgId = parseInt(replymsgIdstr);
      replymsgjson = await session.onebot.getMsg(replymsgId);
      let finalstr: string;
      finalstr = await splicemsgstr(msgjson,replymsgjson);
      //console.log(finalstr);
      session.onebot.sendGroupMsg(groupId,finalstr);
    }else{
      return next();
    }
  })
  
}


//文件读取并存取对象
async function readfilefun(){
  fs.readFile(path.resolve(__dirname, "../storage/storage.json"), 'utf8', (err, storagejson) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      storage = JSON.parse(storagejson);
      //console.log(storagejson);
    } catch (e) {
      console.error(e);
    }
  })
  fs.readFile(path.resolve(__dirname, "../storage/jsontemp.json"), 'utf8', (err, jsontempjson) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      jsontemp = JSON.parse(jsontempjson);
      //console.log(storagejson);
    } catch (e) {
      console.error(e);
    }
  });
  fs.readFile(path.resolve(__dirname, "../storage/white.json"), 'utf8', (err, whitejson) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      white = JSON.parse(whitejson);
      //console.log(storagejson);
    } catch (e) {
      console.error(e);
    }
  });
  fs.readFile(path.resolve(__dirname, "../storage/filelist.json"), 'utf8', (err, filelistjson) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      filelist = JSON.parse(filelistjson);
      //console.log(storagejson);
    } catch (e) {
      console.error(e);
    } 
  });
}

//白名单解析方法
async function parsewhite(msgjson: object): boolean {
  //await readfilefun();
    userId = await msgjson.user_id;
    let whiteqqs: string = await Object.values(white);
    let i: number;
    let len: number;
    len = await whiteqqs.length;
    boolwhite = false;
    //console.log(userId);
    //console.log(whiteqqs[0]);
    for(i=0;i<len;i++){
      //console.log(userId);
      //console.log(whiteqqs[i]);
      if(userId == whiteqqs[i]){
        boolwhite = true;
        break;
      }
    }
    return true;
    //console.log(boolwhite);
}

//解析所回复消息
async function parsermsgId(msgjson: object): string {
    let msgstr: string = await msgjson.raw_message;
    let pos1: number = msgstr.indexOf('reply,id');
    let pos2: number = msgstr.indexOf("]",pos1);
    let msgId: string = await msgstr.substring(pos1+9,pos2);
    //console.log(msgId);
    return msgId;
}

//解析所艾特群员QQ号
async function parseatqq(msgjson: object): string {
    let msgstr: string = await msgjson.raw_message;
    let pos1: number = msgstr.indexOf('at,qq');
    let pos2: number = msgstr.indexOf("]",pos1);
    let atqq: string = await msgstr.substring(pos1+6,pos2);
    return atqq;
}

//写入问答库方法
async function writejson(msgjsonstr: string[],storageset: string[]) {
    const filePath = path.resolve(__dirname, "../storage/storage.json");
    const filePath2 = path.resolve(__dirname, "../storage/jsontemp.json");
    boolfile = true;
    let quesstr: string = msgjsonstr[0];
    let tempstr: string = "";
    let tempnum: number = 0;
    let booldup: boolean = false;
    let i: number;
    let storagenum: number = storageset.length;
    //console.log(storageset);
    let jsoncont: string = "";
    for(i = 0;i < storagenum;i++){
        jsoncont = jsoncont+"\n\""+`${storageset[i]}`+"\""+":"+"\""+`${msgjsonstr[i]}`+"\",";
    }
    let jsonlen: number = jsoncont.length;
    jsoncont = jsoncont.substring(0,jsonlen-1);
    jsoncont = "{"+jsoncont+"\n}"
    //await console.log(jsoncont);
    let storagejson: object = JSON.parse(jsoncont);
    //jsontemp.push(jsoncont);
    //console.log(storagejson);
    let objectnum: number;
    try{
      objectnum = storage.length;
    }catch(err){
      boolfile = false;
      console.error("问答库缓存文件损坏或为空");
      console.error(err);
      objectnum = 0;
    }
    for(i=0;i<objectnum;i++){
      tempstr = JSON.stringify(storage[i]);
      tempnum = i;
      //await console.log(typeof tempstr);
      //await console.log(typeof quesstr)
      //await console.log(tempstr.includes(quesstr));
      if(tempstr.includes(quesstr)){
        booldup = true;
        break;
      }else{
        booldup = false;
      }
    }
    jsonfilestr = "";
    //let index1: number = 0;
    //let index2: number = 0;
    if(booldup){
      //console.log("注："+jsoncont);
      storage[tempnum] = storagejson;
      for(i = 0;i<objectnum;i++){
        if(i==objectnum-1){
          jsonfilestr = jsonfilestr + JSON.stringify(storage[i]);
        }else{
          jsonfilestr = jsonfilestr + JSON.stringify(storage[i])+",";
        }
      }
    }else{
      for(i = 0;i<objectnum+1;i++){
        if(i<objectnum){
          //console.log("怪了 "+jsonfilestr);
          jsonfilestr = jsonfilestr + JSON.stringify(storage[i]) + ",";
          //console.log(i+" "+jsonfilestr+"  "+JSON.stringify(jsontemp[i]));
        }
        if(i==objectnum){
          jsonfilestr = jsonfilestr + jsoncont;
          //console.log(i+" "+jsonfilestr);
        }
      }
    }
    //console.log("以下为新测试内容");
    jsonfilestr = "[\n"+jsonfilestr+"\n]";
    //console.log("111："+jsonfilestr);
    let jsonfile = JSON.parse(jsonfilestr);
    //console.log(jsonfile);
    jsonfilestr = JSON.stringify(jsonfile);
    //console.log("以下为初级JSON字符串");
    //console.log(jsonfilestr);
    //console.log("以下为重组字符串");
    let rejsonfilestr: string = await rejsonstr(jsonfilestr,storageset);
    //console.log(rejsonfilestr);
    try{
      fs.writeFileSync(filePath,rejsonfilestr);
      if(boolfile){
        copyjson(filePath,filePath2);
      }else{
        console.log("文件有错误 取消备份\n");
      }
      //session.onebot.sendGroupMsg(groupId,"已成功写入并备份");
    }catch(err){
      console.log("文件有错误 取消备份\n"+err);
      //session.onebot.sendGroupMsg(groupId,errorstr(err));
    }
}

//备份旧问答库JSON文件
async function copyjson(storage: string, jsontemp: string) {
  // 打开源文件，读取内容
  const content = fs.readFileSync(storage);
  // 创建目标文件，并将源文件的内容写入
  fs.writeFileSync(jsontemp,content);
  console.log("已备份旧JSON");
}

//解析消息写入问答库
async function parsejsonmsg(msgjson: object,msgstr: string,storageset: string[]){
    let storagenum: number = storageset.length;
    //let msgstr: string = await msgjson.raw_message;
    //await console.log("测试-解析消息写入问答库");
    //await console.log(msgstr);
    let i: number;
    let len: number = msgstr.length;
    let pos: number = -1;
    let postemp: number = -1;
    let strtemp: string = "";
    
    for(i=0;i<storagenum;i++){
        postemp = pos;
        if(i === storagenum-1){
            msgjsonstr[i] = msgstr.substring(postemp+1,len);
        }else{
            pos = msgstr.indexOf('\n',pos);
            msgjsonstr[i] = msgstr.substring(postemp+1,pos);
        }
    }
    //pos = 0;
    for(i=0;i<storagenum;i++){
        strtemp = msgjsonstr[i];
        strtemp = strtemp.replace(/\n/g,"\\n");
        //strtemp = strtemp.replace(/\[/g,"\\[");
        //strtemp = strtemp.replace(/\]/g,"\\]");
        //strtemp = strtemp.replace(/\?/g,"\\?");
        strtemp = strtemp.replace(/\//g,"\\/");
        //strtemp = strtemp.replace(/\;/g,"\\;");
        msgjsonstr[i] = strtemp
    }
    //await console.log(msgjsonstr);
    await writejson(msgjsonstr,storageset);
}

//JSON字符串重组
async function rejsonstr(jsonfilestr: string,storageset: string[]): string {
    let len: number = jsonfilestr.length;
    let strarr: string[] = [];
    let i:number;
    let index: number = 0;
    let index2: number = 0;
    let storagenum: number = storageset.length;
    for(i=0;i<len;i++){
        if(jsonfilestr.indexOf("{",index) == -1){
            break;
        }
        else{
            index = jsonfilestr.indexOf("{",index);
            index2 = jsonfilestr.indexOf("}",index2);
            //console.log(index+" "+index2);
            strarr.push(jsonfilestr.substring(index,index2+1));
            index++;
            index2++;
        }
    }
    let rejsonfilestr: string = "";
    //console.log("此为对象整理前的数组："+strarr);
    len = strarr.length;
    let temparr: string[] = [];
    for(i=0;i<len;i++){
        temparr[i] = await reobjectstr(strarr[i],storagenum);
        strarr[i] = temparr[i];
    }
    //console.log("此为对象整理后的数组："+strarr);
    len = strarr.length;
    for(i=0;i<len;i++){
        if(len==1){
            rejsonfilestr = "[\n"+strarr[i]+"\n]";
        }else{
            if(i==0){
                rejsonfilestr = "[\n"+strarr[i]+",\n";
            }else if(i==len-1){
                rejsonfilestr = rejsonfilestr+strarr[i]+"\n]";
            }else{
                rejsonfilestr = rejsonfilestr+strarr[i]+",\n";
            }            
        }
    }
    return rejsonfilestr;
}

//JSON对象字符串重组
async function reobjectstr(objectstr: string,storagenum: number): string {
    let i: number;
    let j: number;
    let objectstrarr: string[] = [];
    let len: string = objectstr.length;
    let index: number = 0;
    let index2: number = 0;
    let fornum: number = 3;
    for(i=0;i<storagenum;i++){
        index = objectstr.indexOf("\"",index);
        index2 = index+1;
        for(j=0;j<fornum;j++){
            index2 = objectstr.indexOf("\"",index2);
            index2++;
        }
        objectstrarr[i] = objectstr.substring(index,index2);
        index = index2;
    }
    //console.log(objectstrarr);
    let reobjectstr: string = "";
    for(i=0;i<storagenum;i++){
        if(i==0){
            reobjectstr = "{\n"+objectstrarr[i]+",\n";
        }else if(i==storagenum-1){
            reobjectstr = reobjectstr+objectstrarr[i]+"\n}";
        }else{
            reobjectstr = reobjectstr+objectstrarr[i]+",\n";
        }
    }
    return reobjectstr;
}

//错误信息输出字符串
async function errorstr(error: unknown): string{
    let errstr: string;
    let index: number;
    if (error instanceof Error) {
        errstr = error.message; // 正确输出异常的消息
        index = errstr.indexOf("\n");
        errstr = errstr.substring(0,index);
        errstr = "发生Error错误\n"+errstr+"\n详情请查看控制台信息";
        console.log(error);
        return errstr;
    }else {
        console.log(error); // 错误类型不是 Error，则输出未知错误
        errstr = "发生未知错误";
        return errstr;
    }
}

//问答库回复操作
async function doans(msgjson: object){
    msgcontent = await msgjson.raw_message;
    userId = await msgjson.user_id;
    groupId = await msgjson.group_id;
    let i: number;
    //let j: number;
    let index: number = 0;
    let len: number;
    let indextemp: number = 0
    let pos: number = 0;
    len = storage.length;
    let quesarr: string[] = [];
    //let quesvaluearr: string[];
    let msgregarr: string[] = [];
    //let atqqId: string;
    let msgregarrcont: string;
    let keyword: string;
    for(i=0;i<len;i++){
        quesarr[i] = storage[i].ques;
    }
    for(i=0;i<len;i++){
        if(len==1){
            quesarrstr = "("+quesarr[i]+"]";
        }else if(i==0){
            quesarrstr = "("+quesarr[i]+"|";
        }else if(i==len-1){
            quesarrstr = quesarrstr+quesarr[i]+")";
        }else{
            quesarrstr = quesarrstr+quesarr[i]+"|";
        }
    }
    //quesarrstr = "(A|\u6d4b\u8bd5|B)";
    const regexson = new RegExp(`${quesarrstr}`);
    let regexsonstr: string = regexson.source;
    let regexstr: string = "^\\[CQ:at,qq=(\\d+)]\\s"+regexsonstr+"$";
    const regex1 = new RegExp(`${regexstr}`);
    //const regex2 = new RegExp("^\\[CQ:at,qq=(\\d+)]\\s");
    //console.log(regex1+"\n");
    /*
    if(regex1.test(msgcontent)){
        console.log("匹配1成功");
    }else{
        console.log("匹配1失败");
    }
    if(regex2.test(msgcontent)){
        console.log("匹配2成功");
    }else{
        console.log("匹配2失败");
    }
    */
    if(regex1.test(msgcontent)){
        msgregarr = msgcontent.match(regex1);
        //console.log(msgregarr);
        msgregarrcont = msgregarr[0];
        index = msgregarrcont.indexOf("]");
        len = msgregarrcont.length;
        msgregarrcont = msgregarrcont.substring(index+2,len);
        //console.log(msgregarrcont);
        //atqqId = msgregarr[1];
        keyword = msgregarr[2];
        indextemp = await regexsonstr.indexOf(`${keyword}`);
        index = 0;
        for(i=0;i<indextemp;i++){
            if(regexsonstr.indexOf("|",index)>indextemp){
                break;
            }else{
                index = regexsonstr.indexOf("|",index)+1;
                pos++;
            }
        }
        //index = await regexsonstr.lastIndexOf("|",index)+1;
        //console.log(pos);
        //quesvaluearr = msgregarrcont.match(regexson);
        //console.log(quesvaluearr);
        //quesvalue = quesvaluearr[0]
        //console.log(quesvalue);
        boolkey = true
        ansstr = storage[pos].ans;
        //console.log(ansstr);
    }else{
        boolkey = false;
        ansstr = "未匹配到问答库问题关键词";
    }
}

//图片名字替换获取
async function parseimagename(msgjson: object): string[] {
  let msgstr: string = await msgjson.raw_message;
  let cutstr: string = "";
  let filenamestr: string = "";
  let filenamearr: string[] = [];
  let index1: number = 0;
  let index2: number = 0;
  let index3: number = 0;
  let index4: number = 0;
  let len: number;
  let i: number;
  //for(i=0;i<)
  //console.log(msgstr);
  len = msgstr.length;
  for(i=0;i<len;i++){
    if(msgstr.indexOf("\[CQ:image",index1) == -1){
      //console.log(msgstr);
      break;
    }else{
      index1 = msgstr.indexOf("\[CQ:image",index1);
      index2 = msgstr.indexOf("\]",index1);
      //console.log(index1+" "+index2);
      cutstr = msgstr.substring(index1,index2+1);
      msgstr = msgstr.replace(cutstr,"");
      //console.log(cutstr);
      index3 = cutstr.indexOf("file=")+5;
      index4 = cutstr.indexOf(",",index3);
      //console.log(index3+" "+index4);
      filenamestr = cutstr.substring(index3,index4);
      //console.log(filenamestr);
            //break;
      filenamearr[i] = await filenamestr;
      //await index1++;
    }
  }
  //console.log(filenamearr);
  return filenamearr;
}

//图片URL替换获取
async function parseimageurl(msgjson: object): string[] {
  let msgstr: string = await msgjson.raw_message;
  let cutstr: string = "";
  let urlstr: string = "";
  let urlarr: string[] = [];
  let index1: number = 0;
  let index2: number = 0;
  let index3: number = 0;
  let index4: number = 0;
  let len: number;
  let i: number;
  //for(i=0;i<)
  //console.log(msgstr);
  len = msgstr.length;
  for(i=0;i<len;i++){
    if(msgstr.indexOf("\[CQ:image",index1) == -1){
      //console.log(msgstr);
      break;
    }else{
      index1 = msgstr.indexOf("\[CQ:image",index1);
      index2 = msgstr.indexOf("\]",index1);
      //console.log(index1+" "+index2);
      cutstr = msgstr.substring(index1,index2+1);
      msgstr = msgstr.replace(cutstr,"");
      //console.log(cutstr);
      index3 = cutstr.indexOf("url=")+4;
      index4 = cutstr.indexOf("\]",index3);
      //console.log(index3+" "+index4);
      urlstr = cutstr.substring(index3,index4);
      //console.log(urlstr);
            //break;
      urlarr[i] = await urlstr;
      //await index1++;
    }
  }
  //console.log(filenamearr);
  return urlarr;
}

//图片CQ编码部分字符串获取
async function parsecq(msgstr: string): string[] {
  //let msgstr: string = await msgjson.raw_message;
  let cutstr: string = "";
  let cqstr: string = "";
  let cqarr: string[] = [];
  let index1: number = 0;
  let index2: number = 0;
  //let index3: number = 0;
  //let index4: number = 0;
  let len: number;
  let i: number;
  //for(i=0;i<)
  //console.log(msgstr);
  len = msgstr.length;
  for(i=0;i<len;i++){
    if(msgstr.indexOf("\[CQ:image",index1) == -1){
      //console.log(msgstr);
      break;
    }else{
      index1 = msgstr.indexOf("\[CQ:image",index1);
      index2 = msgstr.indexOf("\]",index1);
      //console.log(index1+" "+index2);
      cqstr = msgstr.substring(index1,index2+1);
      cqarr[i] = cqstr;
      /*
      msgstr = msgstr.replace(cutstr,"");
      //console.log(cutstr);
      index3 = cutstr.indexOf("url=")+4;
      index4 = cutstr.indexOf("\]",index3);
      //console.log(index3+" "+index4);
      urlstr = cutstr.substring(index3,index4);
      console.log(urlstr);
            //break;
      urlarr[i] = await urlstr;
      */
      index1++;
    }
  }
  //console.log(filenamearr);
  return cqarr;
}

//手动解析图片src
async function parseimagesrc(elements): string[]{
  let len: number = 0;
  let i: number = 0;
  let pos: number = 0;
  let sequence: number[] = [];
  let tempobject: object = null;
  let srcarr: string[] = [];
  len = elements.length;
  for(i=0;i<len;i++){
    tempobject = elements[i];
    //console.log(typeof tempobject);
    if(tempobject.type == "img"){
      //console.log(111)
      sequence.push(i);
    }
  }
  //len = 0;
  len = sequence.length;
  //console.log(len);
  for(i=0;i<len;i++){
    pos = sequence[i]
    //console.log(pos);
    srcarr[i] = elements[pos].attrs.src;
    //console.log(elements[pos]);
    //console.log(elements[pos].attrs.src);
    //console.log(srcarr[i]);
  }
  //console.log(srcarr);
  return srcarr;
}

//重组图片CQ码
async function reconfigCQ(imgurl: string): string {
  let reconfigstr: string = "";
  reconfigstr = "\[CQ:image,file="+imgurl+"\]";
  return reconfigstr;
}

//消息拼接
async function splicemsgstr(msgjson: object,replymsgjson: object): string {
  let text1: string;
  let text2: string;
  let index1: number;
  let index2: number;
  let i: number;
  let len: number;
  let replycqarr: string[] = [];
  text1 = msgjson.raw_message;
  text2 = replymsgjson.raw_message;
  text1 = await text1.replace("。执行消息拼接\n","");
  text1 = await text1.replace("。执行消息拼接","");
  len = text1.length;
  for(i=0;i<len;i++){
    if(text1.includes("[CQ:reply,id=")){
      index1 = text1.indexOf("[CQ:reply,id=");
      index2 = text1.indexOf("]",index1);
      replycqarr[i] = text1.substring(index1,index2+1);
    }else{
      break;
    }
  }
  len = replycqarr.length;
  for(i=0;i<len;i++){
    text1 = text1.replace(replycqarr[i],"");
  }
  return text2+"\n"+text1;
}

/*
async function uploadLocalImage(filePath: string): Promise<void> {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 第一步：生成临时上传 Token
    const tokenResponse = await axios.post(
      `${PICUI_API_BASE_URL}/images/tokens`,
      {
        num: 1, // 生成 1 个 Token
        seconds: 3600, // Token 有效期 1 小时
      },
      {
        headers: {
          Authorization: PICUI_API_TOKEN,
          Accept: "application/json",
        },
      }
    );
    

    if (!tokenResponse.data.status) {
      throw new Error(`Failed to generate upload token: ${tokenResponse.data.message}`);
    }

    const uploadToken = tokenResponse.data.data.tokens[0].token;
    console.log("Upload token generated successfully.");

    // 第二步：读取本地图片文件
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // 第三步：上传图片到 PICUI 图床
    const uploadResponse = await axios.post(
      `${PICUI_API_BASE_URL}/upload`,
      {
        file: fileBuffer, // 使用读取到的文件内容
        token: uploadToken,
        permission: 1, // 设置为公开
        strategy_id: 1, // 替换为你的存储策略 ID
        album_id: null, // 如果需要上传到特定相册，替换为相册 ID
        expired_at: null, // 如果需要设置图片过期时间，格式为 "yyyy-MM-dd HH:mm:ss"
      },
      {
        headers: {
          Authorization: PICUI_API_TOKEN,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!uploadResponse.data.status) {
      throw new Error(`Failed to upload image: ${uploadResponse.data.message}`);
    }

    console.log("Image uploaded successfully.");
    console.log("Image URL:", uploadResponse.data.data.links.url);

  } catch (error) {
    console.error("Error:", error.message);
  }
}
*/
/*
async function fetchQQImageBuffer(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    console.log(Buffer.from(response.data));
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw error;
  }
}

async function uploadToPICUI(buffer, fileName) {
  try {
    // 获取临时上传 Token
    const tokenResponse = await axios.post(
      `${PICUI_API_BASE_URL}/images/tokens`,
      { num: 1, seconds: 3600 },
      { headers: { Authorization: PICUI_API_TOKEN, Accept: "application/json" } }
    );
    const uploadToken = tokenResponse.data.data.tokens[0].token;
    
    
    const arrayBuffer = buffer.buffer;
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    
    const form = new FormData();
    form.append("file", blob, { filename: fileName, contentType: "image/png" }); // 指定文件名和 MIME 类型
    form.append("permission", 1); // 设置为公开
    form.append("strategy_id", 1); // 替换为你的存储策略 ID
    
    
    const requestBody = {
      file: buffer, // 假设图片是 PNG 格式
      permission: 1, // 设置为公开
      strategy_id: 1, // 替换为你的存储策略 ID
      album_id: null, // 可选：指定相册 ID
      expired_at: null // 可选：设置图片过期时间
    };

    // 上传图片
    const uploadResponse = await axios.post(
      `${PICUI_API_BASE_URL}/upload`,
      requestBody,
      {
        headers: {
          Authorization: PICUI_API_TOKEN,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (uploadResponse.data.status) {
      console.log("Image uploaded successfully:", uploadResponse.data.data.links.url);
      return uploadResponse.data.data.links.url;
    } else {
      console.error("Upload failed:", uploadResponse.data.message);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
*/

async function uploadImageFromURL(imageUrl: string,filename: string) {
  //console.log("注意：\n");
  //console.log(imageUrl+"\n"+imagename);
  try {
    // 第一步：使用 axios 从图片 URL 获取图片内容
    //console.log(`Fetching image from URL: ${imageUrl}`);
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer', // 设置响应类型为 ArrayBuffer
      headers: {
        'Accept': 'image/jpeg, image/png, image/gif, image/webp' // 明确指定接受的图片格式
      }
    });

    if (imageResponse.status !== 200) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = Buffer.from(imageResponse.data); // 将 ArrayBuffer 转换为 Buffer
    console.log(`Image fetched successfully. Size: ${imageBuffer.length} bytes`);

    // 第二步：请求 Picui 图床的临时上传 Token
    const tokenResponse = await axios.post(
      `${PICUI_API_BASE_URL}/images/tokens`,
      {
        num: 1, // 生成 1 个 Token
        seconds: 3600 // Token 有效期为 1 小时
      },
      {
        headers: {
          'Authorization': PICUI_API_TOKEN,
          'Accept': 'application/json'
        }
      }
    );

    if (!tokenResponse.data.status) {
      throw new Error(`Failed to get upload token: ${tokenResponse.data.message}`);
    }

    const uploadToken = tokenResponse.data.data.tokens[0].token;

    // 第三步：构造上传请求
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: `${filename}.jpg`, // 可以根据需要设置文件名
      contentType: 'image/jpeg' // 根据图片格式设置 MIME 类型
    });
    //formData.append('token', uploadToken);
    formData.append('permission', '1'); // 设置为公开（1）或私有（0）
    //formData.append('strategy_id', '1'); // 替换为你的存储策略 ID
    //formData.append('album_id', ''); // 可选：指定相册 ID
    //formData.append('expired_at', ''); // 可选：设置图片过期时间

    // 第四步：上传图片到 Picui 图床
    const uploadResponse = await axios.post(`${PICUI_API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        'Authorization': PICUI_API_TOKEN,
        'Accept': 'application/json'
      }
    });
    
    // 第五步：解析返回的 JSON 数据，获取图片访问 URL
    if (uploadResponse.data.status) {
      const imageUrl = uploadResponse.data.data.links.url; // 获取图片访问 URL
      //console.log("Image uploaded successfully:", imageUrl);
      return imageUrl; // 返回图片访问 URL
    } else {
      console.error("Upload failed:", uploadResponse.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    httperr = error.status;
    boolhttperr = true;
    return null;
  }
}

async function uploadQQImageToPICUI(qqImageUrl,filename) {
  try {
    // 获取 QQ 图片的二进制数据
    //const buffer = await fetchQQImageBuffer(qqImageUrl);
    //await console.log("注！意！："+buffer);
    // 上传到 PICUI 图床
    //const imageUrl = await uploadToPICUI(buffer, "qq_image.jpg"); // 可自定义文件名
    const imageUrl = await uploadImageFromURL(qqImageUrl,filename);
    console.log("PICUI Image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

//验证图片是否已上传
async function judgeImageUpload(filename: string): object {
  let current_page: number = 1;
  let last_page: number;
  let len: number
  let i: number;
  let j: number;
  let index: number;
  let origin_namearr: string[] = [];
  let urlarr: string[] = [];
  let response;
  filename = filename + ".jpg";
  response = await getUploadedImage(current_page, 'newest', 'public', undefined, undefined);
  //console.log(response);
  last_page = response.data.data.last_page;
  //console.log(last_page);
  let imagearr;
  for(i=0;i<last_page;i++){
    if(current_page != last_page){
      await current_page++;
      if(current_page > last_page){
        break;
      }
    }
    response = await getUploadedImage(current_page, 'newest', 'public', undefined, undefined);
    imagearr = await response.data.data.data;
    //console.log(imagearr);
    len = imagearr.length;
    for(j=0;j<len;j++){
      origin_namearr.push(imagearr[j].origin_name);
      urlarr.push(imagearr[j].links.url);
    }
  }
  function isthere(elements,index,array){
    return (elements.match(filename));
  }
  /*
  interface returnobj_inter{
    boolexist_inter: boolean,
    urlarr_inter: string[],
    index_inter: number
  }*/
  if(origin_namearr.find(isthere)){
    boolexist = true;
    index = origin_namearr.indexOf(filename);
    /*console.log(filename);
    console.log(index);
    console.log(urlarr);
    console.log(boolexist);
    */
    let returnobj = {
      boolexist_inter: boolexist,
      urlarr_inter: urlarr,
      index_inter: index
    };
    //console.log(returnobj);
    return returnobj;
    //console.log(index);
  }else{
    boolexist = false;
    index = origin_namearr.indexOf(filename);
    let returnobj = {
      boolexist_inter: boolexist,
      urlarr_inter: urlarr,
      index_inter: index
    };
    //console.log("nop")
    return returnobj;
  }
  //console.log(origin_namearr);
  //console.log(urlarr);
}

/**
 * 获取已上传图片的文件名
 * @param page 页码，默认为 1
 * @param order 排序方式，默认为 'newest'
 * @param permission 权限类型，默认为 'public'
 * @param albumId 相册 ID（可选）
 * @param keyword 筛选关键字（可选）
 * @returns 文件名数组
 */
async function getUploadedImage(
  page: number = 1,
  order: string = 'newest',
  permission: string = 'public',
  albumId?: number,
  keyword?: string
) {
  try {
    // 构造请求参数
    const params = {
      page,
      order,
      permission,
      album_id: albumId,
      q: keyword
    };

    // 发起请求
    const response = await axios.get(`${PICUI_API_BASE_URL}/images`, {
      params,
      headers: {
        'Authorization': PICUI_API_TOKEN,
        'Accept': 'application/json'
      }
    });

    // 检查响应状态
    if (!response.data.status) {
      throw new Error(`Failed to fetch images: ${response.data.message}`);
    }

    // 提取文件名
    //const filenames: string[] = response.data.data.map((image: any) => image.origin_name);
    //return filenames;
    return response;
  } catch (error) {
    console.error('Error fetching image filenames:', error);
    throw error;
  }
}

async function getGroupRootFiles() {
  
  const filePath = path.resolve(__dirname, "../storage/filelist.json");
  let fileobj: object;
  
  let data = JSON.stringify({
    "group_id": groupId
  });
  let postconfig = {
    method: 'post',
    url: 'http://0.0.0.0:3000/get_group_root_files',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  }
        
  await axios(postconfig)
    .then(async function (response) {
    //await console.log(response.data);
    //await console.log(response.data.data.files);
    //await console.log(response.data.data.files.length);
    fileobj = await response.data.data.files[0];
    })
      .catch(function (error) {
        console.log(error);
      });
  
  interface FileObj {
    fileId: string;
    filename: string;
    uploadtime: string;
  }
  
  let fileId: string = fileobj.file_id;
  let filename: string = fileobj.file_name;
  const now =  new Date();
  const date = now.toLocaleDateString("zh-CN");
  const time = now.toLocaleTimeString("zh-CN");
  let uploadtime = date+" "+time;
  let strarr;
  let filestr: string;
  
  const filejsonobj : FileObj = {
    fileId: fileId,
    filename: filename,
    uploadtime: uploadtime
  };
  
  const objstr = await JSON.stringify(filejsonobj);
  strarr = await arrrebuild(objstr);
  //await objstrrebuild(objs);
  filestr = await jsonrebuild(strarr);
  
  try{
    await fs.writeFileSync(filePath,filestr);
    //session.onebot.sendGroupMsg(groupId,"已成功写入并备份");
  }catch(err){
    console.log(err);
    //console.log("文件有错误 取消备份\n"+err);
    //session.onebot.sendGroupMsg(groupId,errorstr(err));
  }
  
}

async function arrrebuild(objstr: string): string[] {
  let strarr = [];
  let str: string;
  let i: number;
  let len: number;
  len = filelist.length;
  //console.log(filelist);
  for(i=0;i<len;i++){
    await strarr.push(JSON.stringify(filelist[i]));
  }
  await strarr.push(objstr);
  //console.log(strarr);
  return strarr;
}

async function jsonrebuild(strarr: string[]): string {
  let i: number;
  let len: number;
  len = strarr.length;
  let finalstr: string = "";
  let temp;
  for(i=0;i<len;i++){
    temp = await objstrrebuild(strarr[i]);
    if(len == 1){
      finalstr = "[\n"+temp+"\n]";
    }else if(i == 0){
      finalstr = "[\n"+temp+",\n";
    }else if(i == len-1){
      finalstr = finalstr+temp+"\n]";
    }else{
      finalstr = finalstr+temp+",\n";
    }
  }
  //console.log(finalstr);
  return finalstr;
}

async function objstrrebuild(objstr: string): string {
  let i: number;
  let len: number;
  let index1: number = 0;
  let index2: number = 0;
  let objarr = [];
  let temp;
  let finalstr: string = "";
  len = objstr.length;
  for(i=0;i<len;i++){
    if(objstr.indexOf(",",index1) == -1){
      i++;
      break;
    }else{
      index1 = objstr.indexOf(",",index1);
      index1++;
    }
  }
  //console.log(i);
  len = i;
  index1 = 0;
  for(i=0;i<len;i++){
    if(i == len-1){
      index1 = objstr.indexOf("\"",index2);
      index2 = objstr.indexOf("}",index1);
      temp = await objstr.substring(index1,index2)
      await objarr.push(temp);
    }else{
      index1 = objstr.indexOf("\"",index2);
      index2 = objstr.indexOf(",",index1);
      temp = await objstr.substring(index1,index2);
      await objarr.push(temp);
    }
  }
  //console.log(objarr);
  for(i=0;i<len;i++){
    if(i == 0){
      finalstr = "{\n"+objarr[i]+",\n";
    }else if(i == len-1){
      finalstr = finalstr+objarr[i]+"\n}";
    }else{
      finalstr = finalstr+objarr[i]+",\n";
    }
  }
  //console.log(finalstr);
  return finalstr;
}

async function filedelId(): string[] {
  const filePath = path.resolve(__dirname, "../storage/filelist.json");
  
  const now =  new Date();
  const date = now.toLocaleDateString("zh-CN");
  let datenum;
  let datearr = [];
  let Idarr = [];
  let len;
  let i;
  let temp;
  let index: number = 0;
  let Idnum: number = 0;
  let filearr =[];
  let filestr;
  datenum = parseInt(date.replace(/\//g,""));
  //console.log(datestr);
  len = filelist.length;
  for(i=0;i<len;i++){
    temp = filelist[i].uploadtime;
    index = temp.indexOf(" ");
    temp = parseInt(temp.substring(0,index).replace(/\//g,""));
    datearr.push(temp);
  }
  //console.log(datearr);
  for(i=0;i<len;i++){
    if(datenum > datearr[i]){
      index = i;
    }
  }
  //console.log(filelist[3]);
  //console.log(index);
  //Idnum = index;
  //console.log(Idnum);
  for(i=0;i<100;i++){
    if(i == 0 && index == 0){
      break;
    }else if(index < 0){
      break;
    }else{
      Idarr.push(filelist[index].fileId);
    }
    //console.log(index);
    index--;
  }
  index = i-1;
  Idarr.push(i.toString());
  for(i=index;i<len;i++){
    filearr.push(JSON.stringify(filelist[i]));
  }
  filestr = await jsonrebuild(filearr);
  //console.log(filestr);
  
  try{
    fs.writeFileSync(filePath,filestr);
  }catch(err){
    console.log(err);
  }
  
  //console.log(filearr);
  //console.log(Idarr);
  return Idarr;
}