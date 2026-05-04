/**
 * Logger central — wrappers tipados sobre console.
 * Em produção, silencia debug/info; mantém warn/error.
 * Use em vez de console.* direto. Inclui breadcrumb opcional.
 */

const isProd = import.meta.env.PROD;

type LogPayload = unknown;

function format(scope: string, args: LogPayload[]) {
  return [`[${scope}]`, ...args];
}

export const logger = {
  debug(scope: string, ...args: LogPayload[]) {
    if (!isProd) console.debug(...format(scope, args));
  },
  info(scope: string, ...args: LogPayload[]) {
    if (!isProd) console.info(...format(scope, args));
  },
  warn(scope: string, ...args: LogPayload[]) {
    console.warn(...format(scope, args));
  },
  error(scope: string, ...args: LogPayload[]) {
    console.error(...format(scope, args));
  },
};

export type Logger = typeof logger;
