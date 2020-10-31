import { error } from "./log";

const csv = require('csvtojson');

export function getData<T>(filePath): Promise<T> {
    return new Promise((resolve) => {
      csv()
        .fromFile(filePath)
        .then(resolve)
        .catch(() => error(`[Error] ${filePath}에서 .csv 파일을 찾을 수 없습니다.`));
    });
  }
  
