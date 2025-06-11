(()=>{var e={};e.id=708,e.ids=[708],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31687:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>u,serverHooks:()=>g,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>d});var n={};r.r(n),r.d(n,{POST:()=>c});var s=r(96559),o=r(48088),a=r(37719),i=r(32190);let l=new(r(40276)).default({apiKey:process.env.OPENAI_API_KEY});async function c(e){try{console.log("=== Translation API Debug Info ==="),console.log("OPENAI_API_KEY exists:",!!process.env.OPENAI_API_KEY),console.log("OPENAI_API_KEY length:",process.env.OPENAI_API_KEY?.length||0),console.log("Request URL:",e.url),console.log("Request method:",e.method);let{text:t}=await e.json();if(console.log("Input text:",t),!t||!t.trim())return console.log("No text provided"),i.NextResponse.json({success:!1,error:"No text provided"});if(!/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(t))return console.log("No Korean text detected"),i.NextResponse.json({success:!1,error:"No Korean text detected"});console.log("Korean text detected, starting translation...");let r=t.length<=100,n=r?`You are a translator for Korean titles. Focus on literal translation while preserving the meaning and making it suitable for English-speaking audiences.

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
English: "The Truth About Romance in K-Dramas"`:`You are a translator for Korean comments and content. Translate Korean text to natural, engaging English while preserving the original meaning, tone, and cultural context.

GUIDELINES:
• Translate Korean comments/content to natural English
• Preserve the original tone and emotion (humor, sarcasm, excitement, etc.)
• Keep Korean slang and expressions when possible, with brief explanations if needed
• Maintain the casual/formal level of the original text
• Preserve Korean cultural references and context
• Use natural English expressions that English speakers would understand
• Don't cut off or truncate the translation - translate the complete text
• For internet slang like "ㅋㅋㅋ" use "lol" or "haha"
• For "ㅠㅠ" or "ㅜㅜ" use appropriate emotional expressions like "sob" or keep as "ㅠㅠ"

EXAMPLES:
Korean: "이거 진짜 웃기네 ㅋㅋㅋㅋ 한국 사람들만 이해할 듯"
English: "This is actually hilarious lol Only Koreans would get this"

Korean: "아 진짜 공감되네요 ㅠㅠ 저도 회사에서 이런 경험 있어요"
English: "Oh I really relate to this ㅠㅠ I've had similar experiences at work too"`,s=r?`Translate this Korean title to English: "${t}"`:`Translate this Korean comment/content to English: "${t}"`,o=await l.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:n},{role:"user",content:s}],max_tokens:r?100:500,temperature:.3});console.log("OpenAI response received");let a=o.choices[0]?.message?.content?.trim();if(console.log("Translated text:",a),!a)return console.log("Translation failed - no content received"),i.NextResponse.json({success:!1,error:"Translation failed"});let c=a.replace(/^["']|["']$/g,"");return console.log("Final translated text:",c),i.NextResponse.json({success:!0,translatedText:c})}catch(e){return console.error("Translation API error:",e),console.error("Error details:",{message:e instanceof Error?e.message:"Unknown error",stack:e instanceof Error?e.stack:void 0}),i.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Translation failed"})}}let u=new s.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/translate/route",pathname:"/api/translate",filename:"route",bundlePath:"app/api/translate/route"},resolvedPagePath:"/Users/damanegi/Desktop/dev/KoreanMemes/src/app/api/translate/route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:p,workUnitAsyncStorage:d,serverHooks:g}=u;function h(){return(0,a.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:d})}},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[447,580,276],()=>r(31687));module.exports=n})();