import db from '../models/index.js';
const { Category } = db;

//카테고리 추가
export const addCategory = async (req, res) => {
    const { categoryName, pId } = req.body;
    if (!categoryName) {
        return res
            .status(400)
            .json({ result: false, message: '카테고리 이름을 입력해주세요.' });
    }
    try {
        const duplicationCategory = await Category.findOne({
            where: { categoryName },
        });

        if (duplicationCategory) {
            return res.status(401).json({
                result: false,
                message: ' 이미 존재하는 카테고리 이름입니다',
            });
        }
        const newCategory = await Category.create({
            categoryName,
            pId: pId || null,
        });
        res.status(201).json({ result: true, data: newCategory });
    } catch (error) {
        res.status(500).json({
            result: false,
            message: '카테고리 저장 중 오류가 발생했습니다.',
            error,
        });
    }
};

// 카테고리 조회
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            result: false,
            message: '카테고리 조회 중 오류가 발생했습니다.',
            error,
        });
    }
};
