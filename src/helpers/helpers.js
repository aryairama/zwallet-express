const response = (res, status, statusCode, message, data) => {
  res.status(statusCode).json({
    status,
    statusCode,
    message,
    data,
  });
};

const responsePagination = (res, status, statusCode, message, data, pagination) => {
  res.status(statusCode).json({
    status,
    statusCode,
    message,
    data,
    pagination,
  });
};

const responseError = (res, status, statusCode, message, error) => {
  res.status(statusCode).json({
    status,
    statusCode,
    message,
    error,
  });
};

const promiseResolveReject = (resolve, reject, error, result) => {
  if (!error) {
    resolve(result);
  } else {
    reject(error);
  }
};

export {
  response,
  responseError,
  promiseResolveReject,
  responsePagination,
};
