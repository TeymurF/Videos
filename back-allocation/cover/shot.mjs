import {createRequire} from 'module';const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:627},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/cover.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({path:'back-allocation-cover.png'});await b.close();
