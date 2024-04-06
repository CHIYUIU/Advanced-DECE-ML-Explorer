import logging

from flask.json import JSONEncoder
from flask import request, jsonify, Blueprint, current_app, Response

from .helpers import trans_data_meta

api = Blueprint('api', __name__)

logger = logging.getLogger('api')


class ApiError(Exception):
    """
    API error handler Exception
    See: http://flask.pocoo.org/docs/0.12/patterns/apierrors/
    """
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@api.errorhandler(ApiError)
def handle_invalid_usage(error):
    logging.exception(error)
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


class BetterJSONEncoder(JSONEncoder):
    """
    JSONEncoder subclass that knows how to encode numpy.ndarray.
    """

    def default(self, o):
        if hasattr(o, 'tolist'):
            return o.tolist()
        return super().default(o)


# inject a more powerful jsonEncoder
api.json_encoder = BetterJSONEncoder


@api.route('/data_meta', methods=['GET'])
def get_data_meta():
    data_meta = trans_data_meta(current_app.dir_manager.dataset_meta)
    return jsonify(data_meta)


@api.route('/cf_meta', methods=['GET'])
def get_cf_meta():
    data_meta = trans_data_meta(current_app.dir_manager.dataset_meta)
    return jsoni