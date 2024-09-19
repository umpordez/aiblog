import util from 'node:util';
import _ from 'lodash';

const ts = () => `${(new Date()).toISOString()} ~ `;
const output = (msg: string) => _.isString(msg) ? msg : util.inspect(msg);

const isTTYout = Boolean(process.stdout.isTTY);
const isTTYerr = Boolean(process.stderr.isTTY);

const labelInfo = isTTYout ? '\x1b[32m{info}\x1b[0m' : '';
const labelError = isTTYerr ? '\x1b[31m!error!\x1b[0m' : '';

function formatError(error: Error | string) : Error {
    if (error instanceof Error) {
        return error;
    }

    const message = output(error);
    const err = new Error(message);

    return err;
}

function info(msg: string, context?: object) {
    const params = [ labelInfo + ts() + output(msg) ];

    if (context) {
        params.push(util.inspect(context));
    }

    params.push('');
    console.log(params.join(''));
}

function errorFn(error: Error | string, context?: object) {
    const formatedError = formatError(error);
    const { stack } = formatedError;
    let { message } = formatedError;

    message = labelError + ts() + message;
    const params = [ message, stack ];

    if (context) { params.push(util.inspect(context)); }

    params.push('');
    console.error(params.join('\n'));
}

export default { error: errorFn, info };
