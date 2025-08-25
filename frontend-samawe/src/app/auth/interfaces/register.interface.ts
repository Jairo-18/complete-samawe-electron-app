import {
  IdentificationType,
  PhoneCode,
  RoleType
} from '../../shared/interfaces/relatedDataGeneral';

export interface RegisterUser {
  userId: string;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleType?: string;
}

export interface CreateUserRelatedData {
  identificationType: IdentificationType[];
  roleType: RoleType[];
  phoneCode: PhoneCode[];
}

export interface RegisterUserRelatedData {
  identificationType: IdentificationType[];
  phoneCode: PhoneCode[];
}
