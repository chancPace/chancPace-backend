import db from '../models/index.js';
import {} from '../config/enum.js';

const { Inquiry } = db;

//ANCHOR - 문의 등록
export const addInquiry = async (req, res) => {
  try {
    const { title, email, contents, memberType } = req.body;

    await Inquiry.create({
      inquiryTitle: title,
      inquiryEmail: email,
      inquiryContents: contents,
      memberType: memberType,
    });
    res.status(200).json({
      result: true,
      message: '문의 등록에 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 문의리스트 전체 조회
export const getAllInquiry = async (req, res) => {
  try {
    const findAllInquiry = await Inquiry.findAll({ order: [['createdAt', 'DESC']] });
    if (!findAllInquiry) {
      res.status(404).json({
        result: false,
        message: '문의가 존재하지 않습니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findAllInquiry,
      message: '문의리스트 전체 조회를 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 문의리스트 1개 조회 / 상세조회
export const getOneInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.query;
    const findInquiry = await Inquiry.findOne({
      where: { id: inquiryId },
    });
    if (!findInquiry) {
      res.status(404).json({
        result: false,
        message: '존재하지 않는 문의입니다.',
      });
    }
    res.status(200).json({
      result: true,
      data: findInquiry,
      message: '문의 1개 조회를 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};

//ANCHOR - 문의 수정
export const updateInquiry = async (req, res) => {
  try {
    const { inquiryId, title, email, contents, memberType, inquiryStatus, isDelete } = req.body;
    const updateData = {
      inquiryTitle: title,
      inquiryEmail: email,
      inquiryContents: contents,
      memberType: memberType,
      inquiryStatus: inquiryStatus,
      isDelete: isDelete,
    };
    //FIXME - 키:값 비어있으면 업데이트 내용에서 빼게 설정
    await Inquiry.update(updateData, {
      where: { id: inquiryId },
    });
    res.status(200).json({
      result: true,
      message: '문의 수정을 성공했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버 오류',
      error: error.message,
    });
  }
};
