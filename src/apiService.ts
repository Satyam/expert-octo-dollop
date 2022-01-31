import { loading, error } from './popups';

const apiService = <
  IN extends Record<string, any> = Record<string, any>,
  OUT extends Record<string, any> = IN,
  OPT extends Record<string, any> = Record<string, any>
>(
  service: string,
  op: {
    op: string;
    id?: ID;
    data?: IN;
    options?: OPT;
  }
): Promise<OUT> => {
  loading.render();
  return fetch(`${window.origin}/api/${service}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(op),
  })
    .then((resp) => {
      if (resp && resp.ok) return resp.json();
      return Promise.reject(resp.statusText);
    })
    .then((resp) => {
      if (resp.error) return Promise.reject(resp.data);
      loading.close();
      return resp.data;
    })
    .catch((err) => {
      loading.close();
      error.render(err);
    });
};

export default apiService;
