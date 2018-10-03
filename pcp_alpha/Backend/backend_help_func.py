import json
from django.http import HttpResponse


def cc_helper_function_one(request, request_type, query_data):
    if request.method == request_type:
        json_data = query_data()
        return HttpResponse(json.dumps(json_data),
                            content_type='application/json')
