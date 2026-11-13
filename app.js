import { animate } from 'motion/mini';
import { QUESTIONS, QUESTION_ORDER, SURVEY_VERSION, scoreAnswers } from './survey.mjs';
import instagramLogo from './asset/instagram-color.svg';
import downloadIcon from './asset/download.svg?raw';
import foxIcon from './asset/fox.svg';
import rabbitIcon from './asset/rabbit.svg';
import lionIcon from './asset/lion.svg';
import bearIcon from './asset/bear.svg';
const instagramIcon = `<img src="${instagramLogo}" alt="" width="22" height="22">`;

(() => {
'use strict';
const CFG=window.TREAT_DNA_CONFIG||{};
const animalIcons={ET:foxIcon,ES:rabbitIcon,CT:lionIcon,CS:bearIcon};
const TYPES={ET:{name:'호기심 대장 탐험가',emoji:'🦊',desc:'새로운 곳에 먼저 다가가고, 신나게 움직이며 세상을 알아가는 편이에요.',color:'#df8855'},ES:{name:'느긋한 모험가',emoji:'🐰',desc:'새로운 것에 호기심을 보이면서도, 자기만의 여유로운 속도로 둘러보는 편이에요.',color:'#77a5b4'},CT:{name:'신중한 에너자이저',emoji:'🦁',desc:'낯선 상황은 충분히 살펴보고, 익숙해지면 활발하게 에너지를 발산하는 편이에요.',color:'#8da263'},CS:{name:'포근한 평화주의자',emoji:'🐻',desc:'익숙한 공간에서 편안함을 느끼고, 차분하게 하루를 즐기는 편이에요.',color:'#c68b9a'}};
const PRODUCTS=['오리가슴살육포','닭가슴살육포','소고기육포','오리안심오돌뼈','돼지등심육포','소홍두깨살육포','오리근위육포'];
const app=document.getElementById('app');
const state={step:0,questionIndex:0,name:'',answers:Array(QUESTIONS.length).fill(null),product:'',mode:'dog',submitted:false,saving:false,saveStatus:'',session:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2)};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3500)}
function scrollTop(){window.scrollTo({top:0,behavior:'smooth'})}
function getResult(){const result=scoreAnswers(state.answers);return {...result,type:TYPES[result.code]};}
let startAnimation=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function floatStartButton(){
startAnimation?.cancel();startAnimation=null;
const button=document.getElementById('start');
if(!button||reducedMotion.matches)return;
startAnimation=animate(button,{transform:['translateY(0px)','translateY(-6px)']},{duration:1.4,ease:'easeInOut',repeat:Infinity,repeatType:'reverse'});
}
reducedMotion.addEventListener('change',floatStartButton);
function intro(){app.innerHTML=`<section class="hero"><h1>우리 강아지는<br>어떤 성향일까?<br><span class="mbti-label">강아지 <span class="mbti-letters">MBTI</span></span></h1><p class="sub">호기심 많은 탐험가일까, 느긋한 평화주의자일까?<br>매일 보던 우리 아이의 모습에서 몰랐던 성향을 발견해 보세요.</p><button class="button orange" id="start">시작하기 →</button></section>`;document.getElementById('start').onclick=()=>{state.step=1;render()};floatStartButton()}
function nameEntry(){
app.innerHTML=`<section class="name-entry"><form id="nameForm"><h2><label for="dogName">강아지 이름을 적어주세요.</label></h2><input id="dogName" class="field" maxlength="24" placeholder="예: 몽이" autocomplete="off" required value="${escape(state.name)}"><button class="button orange" type="submit">검사 시작하기 →</button></form><button class="text-button" id="back">이전으로</button></section>`;
const field=document.getElementById('dogName');
field.oninput=e=>{state.name=e.target.value;field.setCustomValidity('')};
document.getElementById('nameForm').onsubmit=e=>{
e.preventDefault();const name=field.value.trim();
if(!name){field.setCustomValidity('강아지 이름을 적어주세요.');field.reportValidity();return;}
state.name=name;state.step='quiz';render();
};
document.getElementById('back').onclick=()=>{state.step=0;render()};
}
function quiz(){
const position=state.questionIndex,i=QUESTION_ORDER[position],q=QUESTIONS[i];
const title=q.title.replace('{name}이',withParticle(state.name,'이','가'));
const hint=q.preference?'더 좋아하는 쪽의 원을 골라주세요. 가운데는 양쪽이 비슷해요.':'가까운 모습 쪽의 원을 골라주세요. 가운데는 양쪽이 비슷해요.';
app.innerHTML=`<section class="quiz-page"><span class="eyebrow">${position+1} / ${QUESTION_ORDER.length}</span><div class="progress" role="progressbar" aria-label="검사 진행" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${position}"><span style="width:${position/QUESTION_ORDER.length*100}%"></span></div><p class="quiz-dog">${q.preference?'평소 먹어본 간식을 떠올려 주세요.':`${escape(state.name)}의 평소 모습을 떠올려 주세요.`}</p><h2 id="questionTitle" tabindex="-1">${escape(title)}</h2><div class="question"><div class="poles"><span>${escape(q.left)}</span><span>${escape(q.right)}</span></div><div class="choices" role="radiogroup" aria-labelledby="questionTitle" aria-describedby="scaleHint">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="answer" value="${n}" ${state.answers[i]===n?'checked':''} aria-label="${escape(n===1?q.left:n===2?'왼쪽에 조금 가까워요':n===3?'양쪽이 비슷해요':n===4?'오른쪽에 조금 가까워요':q.right)}"><em aria-hidden="true"></em></label>`).join('')}</div><div class="hint" id="scaleHint">${hint}</div></div><div class="nav"><button class="button secondary" id="back">이전</button><button class="button orange" id="next" ${state.answers[i]===null?'disabled':''}>${position===QUESTION_ORDER.length-1?'검사 완료 →':'다음 →'}</button></div></section>`;
app.querySelectorAll('input[name=answer]').forEach(el=>el.onchange=()=>{state.answers[i]=+el.value;document.getElementById('next').disabled=false});
document.getElementById('back').onclick=()=>{if(position===0)state.step=1;else state.questionIndex--;render()};
document.getElementById('next').onclick=()=>{
if(state.answers[i]===null)return;
if(position===QUESTION_ORDER.length-1)state.step=2;else state.questionIndex++;
render();
};
document.getElementById('questionTitle').focus({preventScroll:true});
}
function pick(){
app.innerHTML=`<span class="eyebrow">메가주 현장 시식 기록</span><h2>오늘 맛본 간식은<br>어떤 간식인가요? 🦴</h2><p class="sub">오늘 시식한 제품을 골라주세요.</p><div class="progress"><span style="width:100%"></span></div><div class="status warn">⚠️ 간식 급여 전 원료 알레르기·식이 제한·조각 크기·경도를 확인하세요. 긴장하거나 급여가 어려우면 시식을 생략하세요.</div><div class="product-grid">${PRODUCTS.map((x,i)=>`<label class="product-item"><input type="radio" name="product" value="${i}" ${state.product===x?'checked':''}><span>🍖<br>${escape(x)}</span></label>`).join('')}</div><label class="product-item" style="display:block;margin-top:10px"><input type="radio" name="product" value="none" ${state.product==='none'?'checked':''}><span>오늘은 시식하지 않았어요</span></label><div class="sep"></div><span class="label">이 간식은 어떻게 선택했나요?</span><div class="options"><label><input type="radio" name="mode" value="dog" ${state.mode==='dog'?'checked':''}> 강아지가 비교 가능한 간식 중 먼저 관심을 보인 제품이에요</label><label><input type="radio" name="mode" value="owner" ${state.mode==='owner'?'checked':''}> 보호자가 골라주거나 급여한 제품이에요</label></div><div class="nav"><button class="button secondary" id="back">이전</button><button class="button orange" id="result">결과 확인 →</button></div>`;
app.querySelectorAll('input[name=product]').forEach(el=>el.onchange=()=>state.product=el.value==='none'?'none':PRODUCTS[+el.value]);
app.querySelectorAll('input[name=mode]').forEach(el=>el.onchange=()=>state.mode=el.value);
document.getElementById('back').onclick=()=>{state.step='quiz';state.questionIndex=QUESTIONS.length-1;render()};
document.getElementById('result').onclick=()=>{if(!state.product){toast('선택한 간식 또는 시식하지 않음을 골라 주세요.');return;}state.step=3;render();saveResponse();};
}
function selectionText(){if(state.product==='none')return '오늘은 시식 기록 없이 참여했어요.';return state.mode==='dog'?`오늘은 ${state.product}에 먼저 관심을 보였어요!`:`오늘 보호자님이 ${withParticle(state.product,'을','를')} 골라주셨어요.`}
function sharingText(){let r=getResult();return `${state.name.trim()||'우리 아이'}의 강아지 MBTI는 ${r.type.name} (${r.code})! 🐾\n${state.product!=='none'?selectionText()+'\n':''}${CFG.campaignHashtag||'#강아지MBTI'} ${CFG.instagramHandle||''}`}
function withParticle(text,consonant,vowel){const name=String(text??'').trim().normalize('NFC');if(!name)return '';const last=name.charCodeAt(name.length-1);return name+(last>=0xac00&&last<=0xd7a3?((last-0xac00)%28?consonant:vowel):`${consonant}(${vowel})`)}
function externalUrl(value){try{const url=new URL(value);return url.protocol==='https:'?url.href:''}catch{return ''}}
function productInfo(){
const hasProduct=state.product&&state.product!=='none';
const heading=hasProduct?`오늘 ${withParticle(state.name.trim()||'우리 아이','이','가')} 관심을 보인 간식 정보예요!`:'오늘은 시식하지 않았어요.';
const description=hasProduct?`<strong>${escape(state.product)}</strong>${escape(withParticle(state.product,'은','는').slice(state.product.length))} <span class="ingredient-highlight">첨가물이 없는</span> <strong>프리미엄 수제 간식</strong>이에요.`:'YEET의 간식을 공식 스토어에서 만나보세요.';
const url=externalUrl(hasProduct?CFG.productUrls?.[state.product]:CFG.storeUrl);
return `<details class="recommend" open><summary>${escape(heading)}</summary><p>${description}</p>${url?`<a class="product-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer">더 알아보기 →</a>`:'<span class="product-link unavailable" aria-disabled="true">더 알아보기 →</span>'}</details>`;
}
function renderOfficialChannels(){
const channels=document.getElementById('officialChannels');
const instagramUrl=externalUrl(CFG.instagramUrl),storeUrl=externalUrl(CFG.storeUrl);
const storeLogo=externalUrl(CFG.storeLogoUrl);
const channel=(url,label,icon)=>url?`<a class="official-channel" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="YEET 공식 ${label} 새 창으로 열기">${icon}<span>${label}</span></a>`:`<span class="official-channel unavailable" aria-disabled="true">${icon}<span>${label}</span></span>`;
channels.innerHTML=channel(instagramUrl,'인스타그램',`<span class="channel-icon" aria-hidden="true">${instagramIcon}</span>`)+channel(storeUrl,'자사몰',storeLogo?`<img class="channel-logo" src="${escape(storeLogo)}" alt="">`:'');
}
function results(){const r=getResult(),dog=escape(state.name.trim()||'우리 아이');app.innerHTML=`<h2 class="result-heading">우리 <strong class="result-name">${dog}</strong>의 성향,<br>결과가 나왔어요!</h2><div class="progress"><span style="width:100%"></span></div><div class="result-card" id="resultCard"><div class="result-logos"><img class="result-event-logo" src="${escape(document.querySelector('.event-logo').src)}" alt="메가주" width="240" height="35"><img class="result-brand-logo" src="${escape(document.querySelector('.brand-logo').src)}" alt="YEET" width="500" height="180"></div><div class="illustration" aria-hidden="true"><img class="result-animal" src="${animalIcons[r.code]}" alt="" width="96" height="96"></div><div class="dog"><strong class="result-name">${dog}</strong>의 성향</div><h2>${r.type.name}<span class="type-code">(${r.code})</span></h2><p class="description">${r.type.desc}</p>${state.product!=='none'?`<div class="picked">${escape(selectionText())}</div>`:''}</div><div class="result-actions"><button class="button instagram" id="share"><span class="instagram-icon" aria-hidden="true">${instagramIcon}</span>결과 공유하기</button><button class="button secondary" id="download"><span class="instagram-icon" aria-hidden="true">${downloadIcon}</span>이미지 저장</button></div>${productInfo()}<p class="smallnote">결과 이미지는 강아지 사진 없이 만들어집니다. 공유 기능은 기기별로 달라 이미지 저장 기능도 제공합니다.</p><p class="status" id="saveStatus">응답 기록 상태를 확인하고 있어요.</p><button class="button outline" id="reset">처음부터 다시하기</button>`;
document.getElementById('download').onclick=downloadCard;document.getElementById('share').onclick=shareCard;document.getElementById('reset').onclick=()=>location.reload();}
function wrap(ctx,text,x,y,maxWidth,lineHeight){let words=String(text).split(' '),line='';for(const w of words){let next=line?line+' '+w:w;if(ctx.measureText(next).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;line=w;}else line=next;}ctx.fillText(line,x,y);return y+lineHeight}
function createCanvas(){
const c=document.createElement('canvas');c.width=1080;c.height=1920;
const ctx=c.getContext('2d'),r=getResult();
ctx.fillStyle='#fff';ctx.fillRect(0,0,1080,1920);
ctx.strokeStyle='#dedede';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(50,50,980,1820,24);ctx.stroke();
ctx.drawImage(document.querySelector('.event-logo'),110,132,320,46.67);ctx.drawImage(document.querySelector('.brand-logo'),770,120,200,72);ctx.textAlign='center';
ctx.drawImage(document.querySelector('.result-animal'),450,370,180,180);
ctx.fillStyle='#35342f';ctx.font='bold 47px "Noto Sans KR",sans-serif';wrap(ctx,(state.name.trim()||'우리 아이').slice(0,24)+'의 성향',540,705,900,65);
ctx.font='900 72px "Noto Sans KR",sans-serif';ctx.fillText(r.type.name+'('+r.code+')',540,880,900);
ctx.font='36px "Noto Sans KR",sans-serif';ctx.fillStyle='#666';wrap(ctx,r.type.desc,540,990,850,65);
ctx.strokeStyle='#dedede';ctx.beginPath();ctx.roundRect(90,1210,900,270,20);ctx.stroke();
ctx.fillStyle='#35342f';ctx.font='bold 39px "Noto Sans KR",sans-serif';wrap(ctx,state.product==='none'?'우리 아이만의 속도와 성향을 함께 알아가요.':selectionText(),540,1315,790,65);

ctx.font='28px "Noto Sans KR",sans-serif';ctx.fillText(CFG.campaignHashtag||'#강아지MBTI',540,1733);
ctx.font='26px "Noto Sans KR",sans-serif';ctx.fillStyle='#777';ctx.fillText('보호자 관찰 기반의 재미있는 성향 테스트',540,1823);return c;}
async function canvasBlob(){await Promise.all([document.fonts.ready,...Array.from(document.querySelectorAll('.top img, .result-animal'),img=>img.decode())]);return new Promise(resolve=>createCanvas().toBlob(resolve,'image/png'))}
async function downloadCard(){try{const blob=await canvasBlob();if(!blob)throw Error('Canvas export error');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${(state.name.trim()||'우리아이').replace(/[^\w가-힣-]/g,'')}-강아지MBTI.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('결과 이미지 저장을 시작했어요.')}catch(e){toast('이미지 저장에 실패했어요. 다른 브라우저에서 시도해 주세요.')}}
async function shareCard(){try{const blob=await canvasBlob();if(!blob)throw Error('Blob missing');const file=new File([blob],'dog-mbti.png',{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'강아지 MBTI',text:sharingText()});return;}if(navigator.share){await navigator.share({title:'강아지 MBTI',text:sharingText(),url:location.href});toast('이미지 공유는 지원되지 않을 수 있어요. 저장 버튼도 이용해 주세요.');return;}toast('이 기기에서는 직접 공유가 지원되지 않아요. 이미지를 저장해 주세요.')}catch(e){if(e.name!=='AbortError')toast('공유하지 못했어요. 이미지 저장을 이용해 주세요.')}}
let pending=null;window.addEventListener('message',e=>{if(!pending)return;const okOrigin=e.origin==='https://script.google.com'||e.origin.endsWith('.googleusercontent.com');if(!okOrigin||e.source!==pending.frame.contentWindow||!e.data||e.data.kind!=='TREAT_DNA_SHEET'||e.data.nonce!==pending.nonce)return;clearTimeout(pending.timer);pending.frame.remove();const st=document.getElementById('saveStatus');if(st)st.textContent=e.data.ok?'✅ 구글시트에 응답이 저장되었습니다.':'⚠️ 시트 기록 실패: '+(e.data.error||'알 수 없는 오류');pending=null;});
function saveResponse(){const st=document.getElementById('saveStatus');const url=CFG.appsScriptUrl||'';if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)){if(st)st.remove();return;}const nonce=Math.random().toString(36).slice(2)+Date.now().toString(36);const frame=document.createElement('iframe');frame.name='sheet_'+nonce;frame.style.display='none';frame.setAttribute('aria-hidden','true');document.body.append(frame);const form=document.createElement('form');form.method='POST';form.action=url;form.target=frame.name;form.style.display='none';let r=getResult();const data={nonce,surveyVersion:SURVEY_VERSION,sessionId:state.session,dogName:state.name.trim().slice(0,24),answers:JSON.stringify(state.answers),product:state.product==='none'?'시식하지 않음':state.product,selectionMode:state.product==='none'?'none':state.mode,type:r.code,novelty:r.novelty===null?'':r.novelty.toFixed(3),activity:r.activity===null?'':r.activity.toFixed(3),ambiguous:r.ambiguous?'Y':'N'};for(const [k,v]of Object.entries(data)){const el=document.createElement('input');el.type='hidden';el.name=k;el.value=String(v);form.append(el)}document.body.append(form);pending={nonce,frame,timer:setTimeout(()=>{if(pending&&pending.nonce===nonce){const x=document.getElementById('saveStatus');if(x)x.textContent='⚠️ 저장 확인 응답을 받지 못했어요. 구글시트에서 직접 확인해 주세요.';frame.remove();pending=null;}},15000)};form.submit();form.remove();}
function render(){startAnimation?.cancel();startAnimation=null;scrollTop();if(state.step===0)intro();else if(state.step===1)nameEntry();else if(state.step==='quiz')quiz();else if(state.step===2)pick();else results()};renderOfficialChannels();render();
})();
