from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("add-job/", views.add_job, name="add_job"),
    path("update-job/<int:job_id>/", views.update_job, name="update_job"),
    path("delete-job/<int:job_id>/", views.delete_job, name="delete_job"),
]