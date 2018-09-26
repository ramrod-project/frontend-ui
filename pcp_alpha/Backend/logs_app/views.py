from django.shortcuts import render


def get_log_data(request):
    """
    Renders log page with logs data
    :return: log page in the ui
    """
    return render(request,
                  'logs_app/logs_page.html',
                  context={})  # query logs table here to render page with logs data

