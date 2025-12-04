declare module 'express' {
  export interface Request {
    body: any;
    params: any;
    query: any;
    ip: string;
    url: string;
    method: string;
  }

  export interface Response {
    json(body: any): Response;
    status(code: number): Response;
    send(body: any): Response;
    on(event: string, callback: () => void): void;
    statusCode: number;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface IRouter {
    get(path: string, ...handlers: any[]): IRouter;
    post(path: string, ...handlers: any[]): IRouter;
    patch(path: string, ...handlers: any[]): IRouter;
    use(...handlers: any[]): IRouter;
  }

  export interface Application {
    use(...handlers: any[]): Application;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
    patch(path: string, ...handlers: any[]): Application;
    all(path: string, ...handlers: any[]): Application;
    listen(port: number | string, callback?: () => void): any;
  }

  export interface Express {
    (): Application;
    Router(): IRouter;
    json(): any;
  }

  function express(): Application;
  namespace express {
    function Router(): IRouter;
    function json(): any;
  }

  export function Router(): IRouter;
  export type Router = IRouter;
  export function json(): any;

  export default express;
}

declare module 'cors' {
  function cors(options?: any): any;
  export default cors;
}

declare module 'dotenv' {
  export function config(options?: any): void;
}

declare module 'swagger-ui-express' {
  export function serve(handlers: any[]): any;
  export function setup(spec: any): any;
}

declare module 'swagger-jsdoc' {
  export interface Options {
    definition: any;
    apis: string[];
  }
  function swaggerJsdoc(options: Options): any;
  export default swaggerJsdoc;
  export = swaggerJsdoc;
}

declare module 'winston' {
  export interface Logger {
    info(message: string | object, meta?: any): void;
    error(message: string | object, meta?: any): void;
    warn(message: string | object, meta?: any): void;
    debug(message: string | object, meta?: any): void;
    add(transport: any): void;
  }
  export function createLogger(options: any): Logger;
  export namespace format {
    export function combine(...formats: any[]): any;
    export function timestamp(): any;
    export function errors(options: any): any;
    export function json(): any;
    export function colorize(): any;
    export function simple(): any;
  }
  export namespace transports {
    export class File {
      constructor(options: any);
    }
    export class Console {
      constructor(options: any);
    }
  }
}

declare module 'express-validator' {
  export function body(field: string, ...validators: any[]): any;
  export function param(field: string, ...validators: any[]): any;
  export function query(field: string, ...validators: any[]): any;
  export function validationResult(req: any): {
    isEmpty(): boolean;
    array(): any[];
  };
}

declare module '@prisma/client' {
  export interface PrismaClientOptions {
    log?: Array<'query' | 'info' | 'warn' | 'error'>;
  }
  export class PrismaClient {
    lead: any;
    event: any;
    package: any;
    quote: any;
    leadStatusHistory: any;
    $queryRaw(strings: TemplateStringsArray, ...values: any[]): Promise<any>;
    $transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
    $disconnect(): Promise<void>;
    constructor(options?: PrismaClientOptions);
  }
  export enum LeadStatus {
    New = 'New',
    Contacted = 'Contacted',
    QuoteSent = 'QuoteSent',
    Interested = 'Interested',
    ClosedWon = 'ClosedWon',
    ClosedLost = 'ClosedLost',
  }
  export namespace Prisma {
    export interface LeadWhereInput {
      status?: LeadStatus;
      eventId?: string;
      event?: {
        startDate?: {
          gte?: Date;
          lt?: Date;
        };
      };
    }
  }
}
