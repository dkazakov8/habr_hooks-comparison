import * as t from 'ts-interface-checker';
// tslint:disable:object-literal-key-quotes

export const ApiRoute = t.iface([], {
  url: 'string',
  name: 'string',
  method: t.union(t.lit('GET'), t.lit('POST')),
  headers: t.opt('any'),
});

export const RequestParams = t.iface([], {
  email: 'string',
  password: 'string',
});

export const ResponseParams = t.iface([], {
  email: 'string',
  sessionExpires: 'number',
});

export const AuthApiRoute = t.intersection(
  'ApiRoute',
  t.iface([], {
    params: t.opt('RequestParams'),
    response: t.opt('ResponseParams'),
  })
);

const exportedTypeSuite: t.ITypeSuite = {
  ApiRoute,
  RequestParams,
  ResponseParams,
  AuthApiRoute,
};
export default exportedTypeSuite;
