import { DataTypes } from 'sequelize';
import { MemberType, InquiryStatus } from '../config/enum.js';

const InquiryModel = (sequelize) => {
  const Inquiry = sequelize.define('inquiries', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // 제목
    inquiryTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 이메일
    inquiryEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 문의 이름
    inquiryName:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 핸드폰 번호
    inquiryPhoneNumber:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 문의 내용
    inquiryContents: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 회원 타입 (회원 / 비회원)
    memberType: {
      type: DataTypes.ENUM(MemberType.MEMBER, MemberType.NONMEMBER),
      allowNull: false,
    },
    // 문의 상태 (답장완 / 답장전)
    inquiryStatus: {
      type: DataTypes.ENUM(InquiryStatus.COMPLETED, InquiryStatus.UNCOMPLETED),
      allowNull: false,
      defaultValue: InquiryStatus.UNCOMPLETED,
    },
    // 삭제
    isDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  return Inquiry;
};

export default InquiryModel;
