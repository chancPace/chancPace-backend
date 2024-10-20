import db from '../models/index.js';

const Space = db.Space;

//ANCHOR - 공간 등록
export const addNewSpace = async (req, res) => {
  try {
    const { spaceName, spaceLocation, description, spacePrice, discount, amenities, cleanTime, spaceStatus, isOpen } =
      req.body;

    //FIXME - 공간 등록 요청한 사람이 host인지 검사 필요???
    //FIXME - 이미지, 기준인원(최소인원~최대인원) 검사 추가

    const newSpace = await Space.create({
      spaceName,
      spaceLocation,
      description,
      spacePrice,
      discount,
      amenities,
      cleanTime,
      spaceStatus,
      isOpen,
    });

    res.status(201).json({ result: true, data: newSpace, message: '공간 등록이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ result: false, message: '서버오류' });
  }
};
