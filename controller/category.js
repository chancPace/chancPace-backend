import db from '../models/index.js';
const { Category } = db;

//FIXME - 대분류가 존재 하지 않는다면 소분류로 넣지 못하게 막아야함
//ANCHOR - 카테고리 추가
export const addCategory = async (req, res) => {
  try {
    const { categoryName, pId } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        result: false,
        message: '카테고리 이름을 입력해주세요.',
      });
    }

    if (pId === null) {
      const duplicationCategory = await Category.findOne({ where: { categoryName } });
      if (!duplicationCategory) {
        const newCategory = await Category.create({
          categoryName,
          pId,
        });

        res.status(200).json({
          result: true,
          data: newCategory,
          message: `${categoryName}를 대분류 카테고리 추가에 성공했습니다.`,
        });
      } else {
        return res.status(409).json({
          result: false,
          message: '이미 존재하는 카테고리 이름입니다.',
        });
      }
    } else {
      const duplicationCategory = await Category.findOne({ where: { categoryName, pId } });

      if (!duplicationCategory) {
        const newCategory = await Category.create({
          categoryName,
          pId,
        });

        res.status(200).json({
          result: true,
          data: newCategory,
          message: `${categoryName}를 소분류 카테고리 추가에 성공했습니다.`,
        });
      } else {
        return res.status(409).json({
          result: false,
          message: '이미 존재하는 카테고리 이름입니다.',
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 저장 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 조회
export const getCategory = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      result: true,
      data: categories,
      message: '카테고리 조회 완료',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '카테고리 조회 중 오류가 발생했습니다.',
      error,
    });
  }
};

//ANCHOR - 카테고리 삭제
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.body;
    // 삭제할 카테고리 조회
    const getCategory = await Category.findOne({ where: { id } });
    console.log('🚀 ~ removeCategory ~ getCategory:', getCategory);

    // 카테고리가 존재하지 않는 경우
    if (!getCategory) {
      return res.status(404).json({
        result: false,
        message: '삭제 할 카테고리가 존재하지 않습니다.',
      });
    }

    // 대분류인 경우
    if (getCategory.pId === null) {
      // 하위 소분류 삭제
      await Category.destroy({ where: { pId: getCategory.id } });
      // 대분류 삭제
      await Category.destroy({ where: { id: getCategory.id } });
      res.status(200).json({
        result: true,
        message: `대분류인 "${getCategory.categoryName}" 및 하위 소분류를 삭제 완료했습니다.`,
      });
    } else {
      // 소분류인 경우
      await Category.destroy({ where: { id: getCategory.id } });
      res.status(200).json({
        result: true,
        message: `소분류인 "${getCategory.categoryName}" 카테고리를 삭제 완료했습니다.`,
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
