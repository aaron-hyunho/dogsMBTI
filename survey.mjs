export const SURVEY_VERSION = 'temperament-treat-v2';
export const QUESTIONS = [
  {axis:'novelty',title:'처음 가본 산책길에서 우리 아이는?',left:'새로운 길을 먼저 탐색해요',right:'주변을 살피며 천천히 움직여요'},
  {axis:'novelty',title:'낯선 공간에 도착했을 때는?',left:'이곳저곳 적극적으로 둘러봐요',right:'익숙해질 때까지 가까이에 머물러요'},
  {axis:'activity',title:'집에서 자유롭게 쉬는 시간에는?',left:'편한 자리에 누워 쉬는 편이에요',right:'장난감을 찾거나 돌아다니는 편이에요'},
  {axis:'activity',title:'평소 산책할 때 움직임은?',left:'느긋한 속도로 걷는 편이에요',right:'경쾌하게 바삐 움직이는 편이에요'},
  {axis:'texture',preference:true,title:'우리 {name}이 더 좋아하는 간식은?',left:'부드럽고 쉽게 씹히는 간식',right:'쫄깃하고 씹는 맛이 있는 간식'},
  {axis:'ingredient',preference:true,title:'우리 {name}이 더 반기는 간식은?',left:'닭·오리·소 같은 고기 간식',right:'연어·명태 같은 생선 간식'},
];
// 표시 순서만 섞고 응답의 저장 순서는 유지합니다.
export const QUESTION_ORDER = [0,4,2,1,5,3];
export function scoreAnswers(answers) {
  const average = axis => {
    const values = QUESTIONS.flatMap((q,i) => q.axis===axis && Number.isInteger(answers[i]) && answers[i]>=1 && answers[i]<=5 ? [answers[i]] : []);
    return values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : null;
  };
  const novelty=average('novelty'),activity=average('activity');
  return {code:(novelty===null||novelty<=3?'E':'C')+(activity===null||activity<=3?'S':'T'),novelty,activity,ambiguous:novelty===null||activity===null||novelty===3||activity===3};
}
