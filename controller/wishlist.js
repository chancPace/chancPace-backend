import { Model } from 'sequelize';
import db from '../models/index.js';

const { User, Wishlist, Space, Image } = db;

//ANCHOR - 찜 등록
export const addWishlist = async (req, res) => {
  try {
    const { userId, spaceId } = req.body;
    const findUser = await User.findOne({
      where: { id: userId },
    });
    if (!findUser) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 유저입니다.',
      });
    }
    const findSpace = await Space.findOne({
      where: { id: spaceId },
    });
    if (!findSpace) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 공간입니다.',
      });
    }
    const newWishlist = {
      userId: findUser.id,
      spaceId: findSpace.id,
    };
    await Wishlist.create(newWishlist);
    res.status(200).json({
      result: true,
      message: `${findUser.userName}님이 ${findSpace.spaceName}의 공간을 찜 했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 찜 삭제
export const removeWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.body;
    const findWishlist = await Wishlist.findOne({
      where: { id: wishlistId },
    });
    if (!findWishlist) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 찜 목록입니다.',
      });
    }
    await Wishlist.destroy({
      where: { id: findWishlist.id },
    });
    res.status(200).json({
      result: true,
      message: '찜목록을 삭제했습니다.',
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};

//ANCHOR - 내가 찜한 목록 가져오기
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.query;
    const findUser = await User.findOne({
      where: { id: userId },
    });
    if (!findUser) {
      return res.status(404).json({
        result: false,
        message: '존재하지 않는 유저입니다.',
      });
    }
    const findWishlist = await Wishlist.findAll({
      where: { userId: findUser.id },
      include: [
        {
          model: Space,
          include: [
            {
              model: Image, // Image 모델을 포함
            },
          ],
        },
      ],
    });
    res.status(200).json({
      result: true,
      data: findWishlist,
      // message: `${findUser.userName}님의 찜 목록을 조회했습니다.`,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: '서버오류',
      error: error.message,
    });
  }
};
