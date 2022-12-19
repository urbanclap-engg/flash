
const Error = {
  UCError: class UCError extends global.Error {
  err_message: any;
  err_stack: any;
  err_type: any;
  code: any;
  is_silent: any;
  constructor(data) {
    data = data || {};
    super();
    let message = data.err_message || data.message
    this.err_message = (typeof message === 'string') ? message : ''
    this.err_stack = data.err_stack || this.stack;
    this.err_type = (typeof data.err_type === 'string' && data.err_type.split(' ').length === 1) ?
      data.err_type : "Error.RPC_INVALID_ERROR_FORMAT";
    if (data.name) this.name = data.name 
    if (data.code) this.code = data.code
    if (data.is_silent) this.is_silent = data.is_silent
  }
}};


export = Error;