/**
 * Apidoc defines.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/**
 * @apiDefine authUser Authorized user access only.
 *
 * Requests are valid only in case the user is authorized and have a valid active session.
 */


/**
 * @apiDefine SessionCheckError
 *
 * @apiErrorExample Error 409:
 *     HTTP/1.1 409 Conflict
 *     {
 *         "code": "MissingParameterError",
 *         "message": "empty session token"
 *     }
 *
 * @apiErrorExample Error 401:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *         "code": "UnauthorizedError",
 *         "message": "invalid session"
 *     }
 */


/**
 * @apiDefine ContentTooBigError
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "InvalidContentError",
 *         "message": "content data is too big"
 *     }
 */


/**
 * @apiDefine InvalidNoteIdError
 *
 * @apiErrorExample Error 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "code": "BadRequestError",
 *         "message": "invalid note id"
 *     }
 */


/**
 * @apiDefine NotFoundError
 *
 * @apiErrorExample Error 404:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "code": "NotFoundError",
 *         "message": "resource was not found"
 *     }
 */


/**
 * @apiDefine MissingParameterError
 *
 * @apiErrorExample Error 409:
 *     HTTP/1.1 409 Conflict
 *     {
 *         "code": "MissingParameterError",
 *         "message": "request data is missing"
 *     }
 */


/**
 * @apiDefine ServerDataSearchError
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "data search failure"
 *     }
 */


/**
 * @apiDefine ServerDataCreationError
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "data creation failure"
 *     }
 */


/**
 * @apiDefine ServerDataSavingError
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "data saving failure"
 *     }
 */


/**
 * @apiDefine ServerTransactionInitError
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "transaction initialization failure"
 *     }
 */


/**
 * @apiDefine ServerTransactionCommitError
 *
 * @apiErrorExample Error 500:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "code": "InternalServerError",
 *         "message": "transaction committing failure"
 *     }
 */
