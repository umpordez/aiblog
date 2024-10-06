/* eslint-disable  @typescript-eslint/no-explicit-any */
import config from './config.js';

async function doRequest(
    url: string,
    method: string,
    body?: any
) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ''
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = token;
    }

    const errorStack = new Error();

    if (method.toLowerCase() === 'get' && body) {
        url = `${url}?${new URLSearchParams(body)}`;
    } else if (!(body instanceof window.FormData)) {
        body = JSON.stringify(body);
    }

    try {
        const { baseApiUrl } = config;

        const response = await fetch(`${baseApiUrl}${url}`, {
            method: method.toUpperCase(),
            credentials: 'include',
            headers,
            body
        });

        if (response.ok) {
            if ((/json/).test(headers.Accept)) {
                const json = await response.json();

                return json;
            }

            return response;
        }

        throw response;
    } catch (ex: any) {
        console.error(ex);

        if (ex.body) {
            try {
                const json = (await ex.json());
                ex.message = json.message || json.msg;
            } catch(err) {
                console.error(err);
            }
        }

        if (ex.status === 401 || ex.status === 403) {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/login';
        }

        errorStack.message = ex.message || ex.statusText;
        throw errorStack;
    }
}

const ajaxAdapter = {
    request: doRequest ,
    post(url: string, body?: any) {
        return doRequest(url, 'POST', body);
    },

    get(url: string, body?: any) {
        return doRequest(url, 'GET', body);
    }
};

export default ajaxAdapter;
