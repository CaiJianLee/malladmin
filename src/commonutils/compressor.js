/**
 *  Created by wangAlen on 2019-12-16 14:06
 */
import Compressor from "compressorjs";

/**
 * 图片压缩
 * @param {Object} file
 * @returns {Promise<unknown>} file
 * @constructor
 */
export const CompressorImg = file => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      convertSize: 500 * 1024,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      }
    });
  });
};
