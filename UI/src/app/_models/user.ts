import { TCModel } from './user/usermodel';

export interface UserModel {
  userNumber: string;
  firstName: string;
  lastName: string;
  privillage: string;
  loginId: string;
  userId: string;
  userName: string;
  password: string;
  email: string;
  accessToken: string;
  userDetails: any;
  isActive: boolean;
  lastLoginDate: string;
}
export interface AccountApplicantLoginResponseModel {
  id: string;
  name: string;
  memberId: string;
  mobile: string;
  refreshToken: string;
  accessToken: string;
  privillage: string[] | null;
}
