const axios = require('axios');

const BACKEND = 'http://136.113.62.112/api';

module.exports = async function (context, req) {
    const path = context.bindingData.path || '';
    const url = `${BACKEND}/${path}`;

    try {
        const response = await axios({
            method: req.method.toLowerCase(),
            url,
            params: req.query,
            data: req.body
        });
        context.res = {
            status: response.status,
            body: response.data,
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.res = {
            status: error.response?.status || 500,
            body: { error: error.message }
        };
    }
};
