import db from '../models/index.js';

const Space = db.Space;

//ANCHOR - 공간 등록
export const addNewSpace = async (req, res) => {
  try {
    const { spaceName, location, description, price, discount, amenities, cleanTime, spaceStatus } = req.body;
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};
