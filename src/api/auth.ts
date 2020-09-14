import { ApiRoute } from '../models/ApiRoute';

type RequestParams = {
  email: string;
  password: string;
};

type ResponseParams = {
  email: string;
  sessionExpires: number;
};

type AuthApiRoute = ApiRoute & { params?: RequestParams; response?: ResponseParams };

export const auth: AuthApiRoute = {
  name: `auth`,
  url: `/auth`,
  method: 'POST',
};
