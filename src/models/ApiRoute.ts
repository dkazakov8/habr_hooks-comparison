export type ApiRoute = {
  url: string;
  name: string;
  method: 'GET' | 'POST';
  headers?: any;
};
