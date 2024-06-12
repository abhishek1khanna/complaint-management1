import {constants} from '../constants.js';

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode ? error.statusCode : 500;
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.send({
        title: "Validation Failed",
        message: error.message,
        status: error.statusCode,
        stackTrace: error.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: error.message,
        status: error.statusCode,
        stackTrace: error.stack,
      });
    case constants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        message: error.message,
        status: error.statusCode,
        stackTrace: error.stack,
      });
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        message: error.message,
        status: error.statusCode,
        stackTrace: error.stack,
      });
    case constants.SERVER_ERROR:
      res.json({
        title: "Server Error",
        message: error.message,
        status: error.statusCode,
        stackTrace: error.stack,
      });
    default:
      //console.log("No error message");
      break;
  }
};

