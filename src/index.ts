/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const csv = require('csvtojson');
const { 정답 } = require("../database/answer");

const csvFilePath = './database/data.csv';
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
  log(`참여한 사람: ${scoreById.size}명`);
  log('');
  log(`만점자 (${score19.length}) -> `, score19);
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

function getScoreById(dataset: Map<string, Omit<DataRow, 'id'>>) {
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
    
}
