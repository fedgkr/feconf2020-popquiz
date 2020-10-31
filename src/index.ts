/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const csv = require('csvtojson');
const chalk = require('chalk');
const { 정답 } = require("../database/answer");
import { chunk } from "lodash";
import { GiftInfo, 경품 } from "../database/gift";

const csvFilePath = './database/data.csv';
const TIMEOUT_MS = 3000;
const { log, table, groupCollapsed, groupEnd } = console;

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

const PERFECT_SCORE = 12;

export async function run() {
  const jsonDataset = await getData();
  const dataset = getMapDataset(jsonDataset);
  const scoreById = getScoreById(dataset);
  const perfectScore = getIdsByScore(scoreById, PERFECT_SCORE);

  groupCollapsed(
    chalk.bold(
    `🚀 [FEConf2020 ${chalk.red('Pop Quiz')}` +
    chalk.yellow(' 당첨자 선정') +
    ' ]'
    )
  );
  log('');
  log(`${chalk.cyan('[NPC]')} 이번 Pop Quiz에 참여해주신 분은 총 ${chalk.bold(scoreById.size)}명이었습니다!`);
  await delay(TIMEOUT_MS);
  log('');
  log(
    `점수를 계산해보니 퀴즈를 모두 맞춰주신 ${PERFECT_SCORE}점 만점자가 총 ${chalk.bold(perfectScore.length)}명 이었고\n그 명단은 다음과 같습니다!: `,
  );
  await delay(TIMEOUT_MS);
  renderTable(perfectScore, 4);
  await delay(TIMEOUT_MS);
  log('');
  log(`${chalk.cyan('[NPC]')} 그럼 이제 동점자 추첨 룰을 기반으로,\n만점자 중에서 ${chalk.underline('경품 당첨자')}를 추첨하겠습니다.`);
  await delay(TIMEOUT_MS);
  log(`${chalk.cyan('[NPC]')} ${chalk.bold('🥁 두구두구두구...')}`);
  await delay(TIMEOUT_MS);
  log(`${chalk.cyan('[NPC]')} ${chalk.bold('🥁 두구두구두구두구두구두구...')}`);
  groupEnd();

  await delay(TIMEOUT_MS);
  log('');
  groupCollapsed(`🎉 ${chalk.inverse('당첨자')}를 발표합니다!!!`);
  await delay(TIMEOUT_MS);
  log('');

  const [fourth1, fourth2, fourth3, third, second, first] = gatcha(perfectScore, 경품);

  log(`🎖  ${fourth1.rank}등 ${fourth1.giftName} 당첨!, ${maskingEmail(fourth1.id)}님!`);
  await delay(TIMEOUT_MS);
  log(`🎖  ${fourth2.rank}등 ${fourth2.giftName} 당첨!, ${maskingEmail(fourth2.id)}님!`);
  await delay(TIMEOUT_MS);
  log(`🎖  ${fourth3.rank}등 ${fourth3.giftName} 당첨!, ${maskingEmail(fourth3.id)}님!`);
  await delay(TIMEOUT_MS);
  log('');
  await delay(TIMEOUT_MS);
  log(`🥉 ${third.rank}등 ${third.giftName} 당첨!, ${maskingEmail(third.id)}님!`);
  await delay(TIMEOUT_MS);
  log('');
  await delay(TIMEOUT_MS);
  log(`🥈 ${second.rank}등 ${second.giftName} 당첨!, ${maskingEmail(second.id)}님!`);
  await delay(TIMEOUT_MS);
  log('');
  await delay(TIMEOUT_MS);
  log(`🥇 ${first.rank}등 ${first.giftName} 당첨!, ${maskingEmail(first.id)}님!`);
  log('');
  await delay(TIMEOUT_MS);
  log('');
  log(`${chalk.cyan('[NPC]')} 모두 축하드립니다! 🎁`);
  groupEnd();
}

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

      return answers?.includes(answer) ? score < 12 ? score + 1 : score : score;
    }, 0);

    scoreById.set(id, score);
  });
  const sorted = Array.from(scoreById.entries()).sort(([, aScore], [, bScore]) => bScore - aScore);

  return new Map(sorted);
}

function getIdsByScore(dataset: Map<string, number>, score: number) {
  return Array.from(dataset.entries()).filter(([, value]) => value === score).map(([id]) => id);
}

export function maskingEmail(email: string) {
    const [id, domain] = email.split('@');
    const [first, second, third, ...middle] = id.split('');
    const idMaskTarget = middle.slice(0, middle.length - 1);
    const last = middle[middle.length - 1];

    const [firstDomain, secondDomain, ...domainMaskTarget] = domain.split('');

    return `${first}${second}${third}${toMask(idMaskTarget)}${last}@${firstDomain}${secondDomain}${toMask(domainMaskTarget)}`;
}

function toMask(target: string[]) {
    return target.map(() => '*').join('');
}

function gatcha(target: string[], giftList: GiftInfo[]) {
  return giftList.reverse().map(({rank, giftName}) => {
    let flag = true;

    while (flag) {
      const key = Date.now() % target.length;
      const id = target[key];

      if (id != null) {
        delete target[key];
        flag = false;

        return {
          rank,
          giftName,
          id,
        };
      } else {
        flag = true;
      }
    }
  });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function renderTable(dataset: string[], unit: number) {
  table(chunk(dataset.map(maskingEmail), unit));
}
