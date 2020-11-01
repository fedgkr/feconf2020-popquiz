import { error } from "./log";

const fs = require('fs-extra');
const csv = require('csvtojson');

export function getData<T>(filePath): Promise<T> {
    return new Promise((resolve) => {
      csv()
        .fromFile(filePath)
        .then(resolve)
        .catch(() => error(`[Error] ${filePath}에서 .csv 파일을 찾을 수 없습니다.`));
    });
  }
  
export function writeFile(name: string, data: string) {
  fs.writeJson(`./database/${name}.json`, { name: data }, err => {
    if (err) return console.error(err);
  });
}
