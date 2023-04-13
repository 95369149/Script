/*

更新日期：2023-03-09
作者：Xiaobl

#!name=Fileball 云盘挂载 阿里,夸克,pikpak三合一
#!desc=添加Synoogy协议，账号随便填，密码填cookie 获取ck的方法
# 阿里云Token获取地址(需要用阿里云盘扫描alist的二维码获得)[ https://alist-doc.nn.ci/docs/driver/aliyundrive ]
# 夸克登录网页版抓包，路径https://drive.quark.cn/1/clouddrive/file
# pikpak 直接填账号密码

# aliyun.example.com
# quark.example.com
# pikpak.example.com

[General]
force-http-engine-hosts = %APPEND% *.example.com:0
//要开mpv的话必须添加

[Script]
云盘挂载 = type=http-request,pattern=^http:\/\/(aliyun|quark|pikpak)\.example\.com,requires-body=1,script-path=https://raw.githubusercontent.com/githubdulong/Script/master/fileball.js

Fileball挂载图标：https://raw.githubusercontent.com/githubdulong/Script/master/Images/Fileball.json

*/


//$surge.
let url=$request.url,body=$request.body,type=url.match(/aliyun|pikpak|quark/)[0];switch(type){case"aliyun":aliyun();break;case"pikpak":pikpak();break;case"quark":quark();break;default:$done({})}function aliyun(){let[e,t,a]=$persistentStore.read("ali_token")?.split(",")||[],i={url:"https://api.aliyundrive.com/adrive/v3/file/list",headers:{Authorization:e}};(async()=>{switch(url.match(/(auth|entry)\.cgi$/)?.[0]){case"auth.cgi":$done({response:{status:200,body:`{"success":true,"data":{"sid":"${await f()}"}}`}});break;case"entry.cgi":if(body.includes("Delete&")){let e=body.match(/path=([^&]+)/)[1];i.url="https://api.aliyundrive.com/v3/batch",i.headers["content-type"]="application/json; charset=UTF-8",i.body=`{"resource":"file","requests":[{"method":"POST","headers":{"Content-Type":"application/json"},"id":"${e}","body":{"file_id":"${e}","drive_id":"${a}"},"url":"/recyclebin/trash"}]}`,$done(i)}else if(body.includes("method=get"))photo();else{let r="root",s=body.match(/folder_path=([^&]+)/)?.[1],o=s?(i.url=i.url.replace(/(parent_id=)/,`$1${s}`),r=s,"files"):"shares",d=`{"fields":"*","drive_id":"${a}","order_direction":"DESC","order_by":"updated_at","limit":100,"parent_file_id":"${r}","all":false}`;i.body=d;let l=[];do{for(;;){let c=await http(i,"post");if(c){var{items:p,next_marker:n}=c;break}0===c&&await f(1)}let h=p.map(e=>({isdir:"folder"===e.type,path:e.file_id,name:e.name,additional:{size:e.size},url:e.url}));l.push(...h),n&&(i.body=d.replace(/false/,`false ,"marker":"${n}"`))}while(n);l=JSON.stringify(l),$persistentStore.write(l,"_file"),$done({response:{status:200,body:`{"success":true,"data":{"total":0,"offset":0,"${o}":${l}}}`}})}break;default:let u=url.includes("fbdownload")?hex2str(url.match(/dlink=%22(.*)%22/)[1]):url.match(/path=(.*$)/)[1];i.url=JSON.parse($persistentStore.read("_file")).filter(e=>e.path===u)[0].url.replace(/https/,"http"),i.headers.Range=$request.headers.Range,$done(i)}async function f(e){let a=await http({headers:{"Content-Type":"application/json"},url:"https://auth.aliyundrive.com/v2/account/token",body:`{"refresh_token":"${t||body.match(/passwd=([^&]*)/)[1]}","grant_type":"refresh_token"}`},"post"),r=`${a.access_token},${a.refresh_token},${a.default_drive_id}`;e&&(i.headers.Authorization=a.access_token),$persistentStore.write(r,"ali_token")}})().catch(()=>$done())}function pikpak(){let e=["https://api-drive.mypikpak.com/drive/v1/files?filters=%7B%22phase%22%3A%7B%22eq%22%3A%22PHASE_TYPE_COMPLETE%22%7D%2C%22trashed%22%3A%7B%22eq%22%3Afalse%7D%7D","","&parent_id=","","&thumbnail_size=SIZE_LARGE",],t={url:e.join(""),headers:{authorization:$persistentStore.read("pikpak-ck")}};(async()=>{switch(url.match(/(auth|entry)\.cgi$/)?.[0]){case"auth.cgi":$done({response:{status:200,body:`{"success":true,"data":{"sid":"${await p()}"}}`}});break;case"entry.cgi":if(body.includes("Delete&"))t.url="https://api-drive.mypikpak.com/drive/v1/files:batchTrash",t.body=`{"ids":["${body.match(/path=([^&]+)/)[1]}"]}`,$done(t);else if(body.includes("method=get"))photo();else{let a=body.match(/folder_path=([^&]+)/)?.[1],i=a?(e[3]=a,"files"):"shares",r=[];do{for(t.url=e.join("");;){let s=await http(t);if(s){var{files:o,next_page_token:d}=s;break}await p(1)}let l=o.map(e=>({isdir:!e.file_extension,path:e.id,name:e.name,additional:{size:parseInt(e.size)}}));d&&(e[1]="&page_token="+d),r.push(...l)}while(d);$done({response:{status:200,body:JSON.stringify({success:!0,data:{total:0,offset:0,[i]:r}})}})}break;default:let c=url.match("fbdownload")?hex2str(url.match(/dlink=%22(.*)%22/)[1]):url.match(/path=(.*$)/)[1];t.url=`https://api-drive.mypikpak.com/drive/v1/files/${c}?&thumbnail_size=SIZE_LARGE`;$done({response:{status:302,headers:{Location:(await http(t)).links["application/octet-stream"].url.replace(/https/,"http")}}})}async function p(e){let a=$persistentStore.read("pikpak-account")?.split(",")||(body=decodeURIComponent(body),0),i=a?.[0]||body.match(/account=([^&]+)/)[1],r=a?.[1]||body.match(/passwd=([^&]+)/)[1],s="Bearer "+(await http({url:"https://user.mypikpak.com/v1/auth/signin",body:`{"client_id":"YNxT9w7GMdWvEOKa",
"username":"${i}",
"password":"${r}"}`},"post"))?.["access_token"];e&&(t.headers.authorization=s),$persistentStore.write(i+","+r,"pikpak-account"),$persistentStore.write(s,"pikpak-ck")}})().catch(()=>$done())}function quark(){let e=$persistentStore.read("quark-ck"),t=["https://drive.quark.cn/1/clouddrive/file/sort?_fetch_total=1&_page=",1,"&_size=100&fr=pc&pdir_fid=",0,"&pr=ucpro",],a={url:t.join(""),headers:{cookie:e,"content-type":"application/json"}};(async()=>{switch(url.match(/(auth|entry)\.cgi$/)?.[0]){case"auth.cgi":e=decodeURIComponent(body.match(/passwd=([^&]+)/)[1]),$persistentStore.write(e,"quark-ck"),$done({response:{status:200,body:`{"success":true,"data":{"sid":"${e}"}}`}});break;case"entry.cgi":if(body.includes("Delete&"))a.url="https://drive.quark.cn/1/clouddrive/file/delete?fr=pc&pr=ucpro",a.body=`{"action_type":1,"exclude_fids":[],"filelist":["${body.match(/path=([^&]+)/)[1]}"]}`,$done(a);else if(body.includes("method=get"))photo();else{let i=body.match(/folder_path=([^&]+)/)?.[1],r=i?(t[3]=i,"files"):"shares",s=[];do{if(a.url=t.join(""),1===t[1]){var{metadata:{_total:o},data:{list:d}}=await http(a,"get",1,e);o=parseInt(o/100)+1}else var{data:{list:d}}=await http(a,"get",1,e);let l=d.map(e=>({isdir:!e.file,path:e.fid,name:e.file_name,additional:{size:e.size}}));s.push(...l)}while(t[1]<o&&t[1]++);$done({response:{status:200,body:JSON.stringify({success:!0,data:{total:0,offset:0,[r]:s}})}})}break;default:let c=url.match("fbdownload")?hex2str(url.match(/dlink=%22(.*)%22/)[1]):url.match(/path=(.*$)/)[1];a.url="http://drive.quark.cn/1/clouddrive/file/download?fr=pc&pr=ucpro",a.body=`{"fids":["${c}"]}`;let p=(await http(a,"post")).data[0].download_url.replace(/https/,"http");a.url=p,a.headers.Range=$request.headers.Range,$done(a)}})().catch(()=>$done())}function photo(){$done({response:{method:"GET",status:301,headers:{Location:`http://${type}.example.com:5000/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&mode=open&path=${body.match(/path=([^&?]+)/)[1]}`}}})}function hex2str(e){var t,a=e.trim(),i="0x"===a.substr(0,2).toLowerCase()?a.substr(2):a,r=i.length;if(r%2!=0)return"";for(var s=[],o=0;o<r;o+=2)s.push(String.fromCharCode(t=parseInt(i.substr(o,2),16)));return s.join("")}function http(e,t="get",a,i){return new Promise((r,s)=>{$httpClient[t](e,(e,t,o)=>{switch(a&&(a=t.headers?.["Set-Cookie"]?.split(";")[0])&&$persistentStore.write(i.replace(/[^;]+/,a),"quark-ck"),t?.status){case 200:r(JSON.parse(o));break;case 429:r(null);break;case 401:r(0);break;default:s()}})})}