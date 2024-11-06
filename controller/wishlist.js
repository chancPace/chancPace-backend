import db from '../models/index.js';

const { User, Wishlist, Space } = db;

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
//FIXME - 