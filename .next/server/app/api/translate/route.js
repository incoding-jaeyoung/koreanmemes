(()=>{var e={};e.id=708,e.ids=[708],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31687:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>c,serverHooks:()=>g,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>d});var s={};r.r(s),r.d(s,{POST:()=>u});var n=r(96559),a=r(48088),o=r(37719),i=r(32190);let l=new(r(40276)).default({apiKey:process.env.OPENAI_API_KEY});async function u(e){try{let{text:t}=await e.json();if(!t||!t.trim())return i.NextResponse.json({success:!1,error:"No text provided"});if(!/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(t))return i.NextResponse.json({success:!1,error:"No Korean text detected"});let r=await l.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:`You are a translator for Korean titles. Focus on literal translation while preserving the meaning and making it suitable for English-speaking audiences.

GUIDELINES:
• Translate Korean titles to clear, engaging English titles
• Keep titles concise and punchy for social media/blog format
• Preserve the original meaning and tone
• Make it suitable for English-speaking audiences interested in Korean culture
• Use natural English expressions
• Avoid overly literal translations that sound awkward
• Keep it under 80 characters when possible

EXAMPLES:
Korean: "한국 직장 문화: 눈치의 신비로운 세계"
English: "Korean Office Culture: The Mystery of 'Nunchi' Explained"

Korean: "김치찌개가 맛있는 이유"
English: "Why Kimchi Stew Hits Different"

Korean: "한국 드라마 속 로맨스의 진실"
English: "The Truth About Romance in K-Dramas"`},{role:"user",content:`Translate this Korean title to English: "${t}"`}],max_tokens:100,temperature:.3}),s=r.choices[0]?.message?.content?.trim();if(!s)return i.NextResponse.json({success:!1,error:"Translation failed"});let n=s.replace(/^["']|["']$/g,"");return i.NextResponse.json({success:!0,translatedText:n})}catch(e){return console.error("Translation API error:",e),i.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Translation failed"})}}let c=new n.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/translate/route",pathname:"/api/translate",filename:"route",bundlePath:"app/api/translate/route"},resolvedPagePath:"/Users/damanegi/Desktop/dev/KoreanMemes/src/app/api/translate/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:d,serverHooks:g}=c;function h(){return(0,o.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:d})}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[447,580,276],()=>r(31687));module.exports=s})();