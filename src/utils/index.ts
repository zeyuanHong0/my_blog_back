import { extname } from 'path';

/**
 * 上传的文件名称(时间戳 + 随机数 + 文件后缀)
 * @param file
 */
export const getFileName = (file: Express.Multer.File) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  return `${uniqueSuffix}${ext}`;
};
