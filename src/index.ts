/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const csv = require('csvtojson');
const { 정답 } = require("../database/answer");
const { 경품 } = require("../database/gift");

const csvFilePath = './database/data.csv';
const TIMEOUT_MS = 3000;
const { log, groupCollapsed, groupEnd } = console;

interface DataRow {
  id?: string,
  timestamp?: string;
  question?: string;
  answer_0?: string;
  answer_a_1?: string;
  answer_b_1?: string;
  answer_a_2?: string;
  answer_b_2?: string;
  answer_a_3?: string;
  answer_b_3?: string;
  answer_a_4?: string;
  answer_b_4?: string;
  answer_a_5?: string,
  answer_b_5?: string;
  answer_a_6?: string;
  answer_b_6?: string;
  bonus_1?: string;
  bonus_2?: string;
  bonus_3?: string;
  bonus_4?: string;
  bonus_5?: string;
  bonus_6?: string;
  bonus_7?: string;
}

(async function run() {
  const jsonDataset = await getData();
  const dataset = getMapDataset(jsonDataset);
  const scoreById = getScoreById(dataset);
  const score19 = getIdsByScore(scoreById, 19);

  groupCollapsed('[FEConf2020 Pop Quiz 당첨자 선정]');
  log('');
  log(`[NPC] 이번 Pop Quiz에 참여해주신 분은 총 ${scoreById.size}명이었습니다!`);
  await delay(TIMEOUT_MS);
  log('');
  log(`점수를 계산해보니 만점자가 총 ${score19.length}명 계셨고, 그 명단은 다음과 같습니다! -> `, score19.map(v => maskingEmail(v)));
  await delay(TIMEOUT_MS);
  log('');
  log('[NPC] 그럼 이제 만점자 중에서 추첨을 돌려 경품 당첨자를 뽑이보겠습니다.');
  await delay(TIMEOUT_MS);
  log('[NPC] 두구두구두구...');
  await delay(TIMEOUT_MS);
  log('[NPC] 두구두구두구두구두구두구...');
  await delay(TIMEOUT_MS);
  log('당첨자 -> ', gatcha(score19, 경품));

  log('[NPC] 축하드립니다!');
  groupEnd();
})();

function getData(): Promise<DataRow[]> {
  return new Promise((resolve) => {
    csv()
      .fromFile(csvFilePath)
      .then(resolve);
  });
}

function getMapDataset(jsonDataset) {
  const dataset = new Map<string, Omit<DataRow, 'id'>>();

  jsonDataset.forEach(jsonData => {
    const { id, question, ...data } = jsonData;
    const refinedData = Object.entries(data).reduce((result: DataRow , [key, value]) => {
      // * 입력되지 않은 값 제거, 불필요한 field 제거
      if (value == null || value == '' || key === 'timestamp') {
        return result;
      }
      
      return { ...result, [key]: value };
    }, {});

    const value = dataset.has(id) ? { ...dataset.get(id), ...refinedData } : refinedData;
    
    dataset.set(id, value);
  });

  return dataset;
}

export function getScoreById(dataset: Map<string, Omit<DataRow, 'id'>>) {
  const scoreById = new Map<string, number>();
  
  Array.from(dataset.entries()).map(([id, answerObject]) => {
    const score = Object.entries(answerObject).reduce((score, [questionId, answer]) => {
      const answers = 정답[questionId];

      return answers?.includes(answer) ? score + 1 : score;
    }, 0);

    scoreById.set(id, score);
  });
  const sorted = Array.from(scoreById.entries()).sort(([aId, aScore], [bId, bScore]) => bScore - aScore);

  return new Map(sorted);
}

function getIdsByScore(dataset: Map<string, number>, score: number) {
  return Array.from(dataset.entries()).filter(([, value]) => value === score).map(([id]) => id);
}

function maskingEmail(email: string) {
    const [id, domain] = email.split('@');
    const [first, second, third, ...middle] = id.split('');
    const idMaskTarget = middle.slice(0, middle.length - 1);
    const last = middle[middle.length - 1];
    
    const [firstDomain, secondDomain, ...domainMaskTarget] = domain.split('');

    return `${first}${second}${third}${toMask(idMaskTarget)}${last} @ ${firstDomain}${secondDomain}${toMask(domainMaskTarget)}`;
}

function toMask(target: string[]) {
    return target.map(() => '*').join('');
}

function gatcha(target: string[], giftList: Record<number, string>) {
  return Object.entries(giftList).reverse().map(([rank, giftName]) => {
    let flag = true;

    while (flag) {
      const key = Date.now() % target.length;
      const id = target[key];

      if (id != null) {
        delete target[key];
        flag = false;

        return `${rank}등 당첨, ${id}님! ${giftName} 당첨!`;
      } else {
        flag = true;
      }
    }
  });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
