import db from '../models/index.js';

const Space = db.Space;

//ANCHOR - 공간 등록
export const addNewSpace = async (req, res) => {
  try {
    const { spaceName, spaceLocation, description, spacePrice, discount, amenities, cleanTime, spaceStatus, isOpen } =
      req.body;
    // console.log(
    //   '🚀 ~ addNewSpace ~  spaceName, spaceLocation, description, spacePrice, discount, amenities, cleanTime, spaceStatus, isOpen:',
    //   spaceName,
    //   spaceLocation,
    //   description,
    //   spacePrice,
    //   discount,
    //   amenities,
    //   cleanTime,
    //   spaceStatus,
    //   isOpen
    // );
    const reponse = await Space.create({where:{}})
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};
