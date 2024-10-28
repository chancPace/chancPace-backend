import { Op, where } from 'sequelize';
import db from '../models/index.js';
const { Category } = db;

//ANCHOR - 카테고리 대분류 추가
export const addBigCategory = async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) {
    return res.status(400).json({
      result: false,
      message: '카테고리 이름을 입력해주세요.',
    });
  }

  try {
    const duplicationCategory = await Category.findOne({ where: { categoryName, pId: null } });
    if (duplicationCategory) {
      return res.status(409).json({
        result: false,
        message: ' 이미 존재하는 카테고리 이름입니다',
      });
    }

    const newCategory = await Category.create({
      categoryName,
      pId: null,
    });

    res.status(201).json({ result: true, newCategory, message: '대분류 등록이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 저장 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 소분류 추가
export const addSmallCategory = async (req, res) => {
  try {
    const { bigCategoryId, categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        result: false,
        message: '카테고리 이름을 입력해 주세요',
      });
    }

    // 대분류가 존재하는지 확인
    const bigCategoryExists = await Category.findOne({ where: { id: bigCategoryId, pId: null } });
    if (!bigCategoryExists) {
      return res.status(404).json({
        result: false,
        message: '대분류가 존재하지 않습니다.',
      });
    }

    // 대분류 내에서만 중복 검사
    const duplicationCategory = await Category.findOne({ where: { categoryName, pId: bigCategoryId } });
    if (duplicationCategory) {
      return res.status(409).json({
        result: false,
        message: '이미 존재하는 카테고리 이름입니다.',
      });
    }

    // 소분류 등록
    const newSmallCategory = await Category.create({ categoryName, pId: bigCategoryId });
    res.status(200).json({
      result: true,
      data: newSmallCategory,
      message: '소분류 등록이 완료되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      result: false,
      message: '카테고리 저장 중 오류가 발생했습니다.',
      error,
    });
  }
};

// ANCHOR - 카테고리 대분류 조회
export const getBigCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { pId: null } });

    res.status(200).json({
      result: true,
      data: categories,
      message: '카테고리 조회 성공',
    });
  } catch (error) {
    console.log('카테고리 에러 발생: ', error);

    res.status(500).json({
      result: false,
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 소분류 조회
export const getSmallCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        pId: { [Op.ne]: null }, // null이 아닌 소분류만 조회 / Op 연산자 사용
      },
    });
    res.status(200).json({
      result: true,
      data: categories,
      message: '카테고리 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 대분류에 해당하는 소분류 조회
export const getSmallCategoriesByBigCategory = async (req, res) => {
  try {
    const { bigCategoryId } = req.body;

    const bigCategory = await Category.findOne({ where: { id: bigCategoryId } });
    if (!bigCategory) {
      return res.status(404).json({
        result: false,
        message: '대분류가 존재하지 않습니다.',
      });
    }
    
    const categories = await Category.findAll({ where: { pId: bigCategoryId } });
    res.status(200).json({
      result: true,
      data: categories,
      message: '카테고리 조회 성공',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 대분류 삭제
export const removeBigCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // 대분류 조회
    const bigCategory = await Category.findOne({ where: { categoryName, pId: null } });

    if (!bigCategory) {
      return res.status(404).json({
        result: false,
        message: '삭제할 대분류 카테고리를 찾을 수 없습니다.',
      });
    }

    // 대분류에 속한 소분류들 삭제
    await Category.destroy({ where: { pId: bigCategory.id } });
    // 대분류 삭제
    await bigCategory.destroy();

    res.status(200).json({
      result: true,
      message: `${categoryName} 대분류 및 해당 소분류들을 삭제했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 삭제 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 소분류 삭제
export const removeSmallCategory = async (req, res) => {
  try {
    const { categoryName, bigCategoryId } = req.body;

    const deletedCount = await Category.destroy({ where: { categoryName, pId: bigCategoryId } });

    if (deletedCount > 0) {
      res.status(200).json({
        result: true,
        message: `${categoryName} 소분류 카테고리를 삭제했습니다.`,
      });
    } else {
      res.status(404).json({
        result: false,
        message: '삭제할 소분류 카테고리를 찾을 수 없습니다.',
      });
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 삭제 중 오류가 발생했습니다.',
      error,
    });
  }
};
