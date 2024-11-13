//ANCHOR - User
export const UserRoles = {
  USER: 'USER',
  HOST: 'HOST',
  ADMIN: 'ADMIN',
};
export const AccountStatuses = {
  ACTIVE: 'ACTIVE',
  BLACKLISTED: 'BLACKLISTED',
  WITHDRAWN: 'WITHDRAWN',
};
export const Genders = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

//ANCHOR - Space
export const SpaceStatuses = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
};

//ANCHOR - Payment
export const PaymentStatuses = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

//ANCHOR - Booking
export const BookingStatuses = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

//ANCHOR - Review
export const ReviewStatus = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
};

//ANCHOR - Inquiry
export const MemberType = {
  MEMBER: 'MEMBER',
  NONMEMBER: 'NONMEMBER',
};
export const InquiryStatus = {
  COMPLETED: 'COMPLETED',
  UNCOMPLETED: 'UNCOMPLETED',
};