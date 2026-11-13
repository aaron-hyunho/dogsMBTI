import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { QUESTIONS, QUESTION_ORDER, SURVEY_VERSION, scoreAnswers } from '../survey.mjs';

const gs=fs.readFileSync(new URL('../Code.gs',import.meta.url),'utf8');
const appSource=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

function backend() {
  const rows=[],tabs=[];
  const context=vm.createContext({
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:name=>{tabs.push(name);return {appendRow:row=>rows.push(row)};}})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    HtmlService:{XFrameOptionsMode:{ALLOWALL:0},createHtmlOutput:html=>({setXFrameOptionsMode:()=>html})},
  });
  vm.runInContext(gs,context);
  return {rows,tabs,post(answers,extra={}){
    const html=context.doPost({parameter:{nonce:'test',surveyVersion:SURVEY_VERSION,answers:JSON.stringify(answers),product:'시식하지 않음',selectionMode:'none',type:'ES',...extra}});
    return JSON.parse(html.match(/postMessage\((.*),"\*"\)/)[1]);
  }};
}

test('간식 선호를 바꿔도 네 성향 유형의 점수는 유지됨',()=>{
  assert.equal(QUESTIONS.length,6);
  for(const [traits,code] of [[[1,1,1,1],'ES'],[[1,1,5,5],'ET'],[[5,5,1,1],'CS'],[[5,5,5,5],'CT']]){
    const expected=scoreAnswers([...traits,3,3]);
    assert.equal(expected.code,code);
    for(const texture of [1,2,3,4,5])for(const ingredient of [1,2,3,4,5]){
      assert.deepEqual(scoreAnswers([...traits,texture,ingredient]),expected);
    }
  }
});

test('성향 축의 평균이 3이면 기존 동점 처리 유지',()=>{
  assert.deepEqual(scoreAnswers([1,5,2,4,5,5]),{code:'ES',novelty:3,activity:3,ambiguous:true});
});

test('서버는 성향 점수를 재계산하고 새 탭의 별도 열에 간식 선호 저장',()=>{
  const server=backend();
  const answers=[5,4,1,2,3,5];
  assert.equal(server.post(answers,{novelty:'1',activity:'5',type:'ET'}).ok,true);
  const row=server.rows[0],result=scoreAnswers(answers);
  assert.equal(server.tabs[0],'응답_v2');
  assert.deepEqual(Array.from(row.slice(3,9)),answers);
  assert.equal(row[11],result.code);
  assert.equal(row[12],result.novelty.toFixed(3));
  assert.equal(row[13],result.activity.toFixed(3));
  assert.equal(row[15],SURVEY_VERSION);
});

test('여섯 문항 모두 필수이며 누락된 응답은 저장하지 않음',()=>{
  const server=backend();
  for(let i=0;i<6;i++){
    const answers=Array(6).fill(3);
    answers[i]=null;
    assert.equal(server.post(answers).ok,false);
  }
  assert.equal(server.rows.length,0);
});

test('필수 응답 누락·잘못된 점수·이전 설문 버전은 기록하지 않음',()=>{
  const server=backend();
  for(const answers of [[null,1,1,1,3,3],[1,1,1,1,0,3],[1,1,1,1,6,3],[1,1,1,1,'3',3],[1,1,1,1,3]]){
    assert.equal(server.post(answers).ok,false);
  }
  assert.equal(server.post([1,1,1,1,3,3],{surveyVersion:''}).ok,false);
  assert.equal(server.rows.length,0);
});

test('섞인 질문 순서에서 필수 선택·이전 답변 복원·최종 이동 동작',()=>{
  const elements=new Map(),radios=[1,2,3,4,5].map(value=>({value}));
  const state={name:'초코',questionIndex:1,step:'quiz',answers:Array(6).fill(null)};
  const app={innerHTML:'',querySelectorAll:()=>radios};
  const context=vm.createContext({QUESTIONS,QUESTION_ORDER,state,app,escape:s=>String(s),render(){},document:{getElementById:id=>{
    if(!elements.has(id))elements.set(id,{disabled:false,focus(){}});
    return elements.get(id);
  }}});
  vm.runInContext(appSource.split('\n').find(line=>line.startsWith('function withParticle(')),context);
  vm.runInContext(appSource.slice(appSource.indexOf('function quiz(){'),appSource.indexOf('function pick(){')),context);
  context.quiz();
  assert.ok(app.innerHTML.includes('우리 초코가 더 좋아하는 간식은?'));
  assert.equal((app.innerHTML.match(/name="answer"/g)||[]).length,5);
  assert.ok(app.innerHTML.includes('먹어본 간식'));
  assert.ok(app.innerHTML.includes('id="next" disabled'));
  assert.ok(!app.innerHTML.includes('id="skip"'));
  elements.get('next').onclick();
  assert.equal(state.questionIndex,1);
  radios[4].onchange();
  assert.equal(state.answers[4],5);
  assert.equal(elements.get('next').disabled,false);
  elements.get('next').onclick();
  assert.equal(state.questionIndex,2);
  context.quiz();
  elements.get('back').onclick();
  assert.equal(state.questionIndex,1);
  context.quiz();
  assert.ok(app.innerHTML.includes('value="5" checked'));
  assert.deepEqual(QUESTION_ORDER.map(i=>QUESTIONS[i].axis),['novelty','texture','activity','novelty','ingredient','activity']);
  for(let position=0;position<6;position++){
    state.questionIndex=position;
    context.quiz();
    assert.ok(app.innerHTML.includes(`${position+1} / 6`));
    assert.ok(!app.innerHTML.includes('id="skip"'));
    radios[position%5].onchange();
    assert.equal(state.answers[QUESTION_ORDER[position]],position%5+1);
    elements.get('next').onclick();
    if(position<5)assert.equal(state.questionIndex,position+1);
  }
  assert.equal(state.step,2);
});
