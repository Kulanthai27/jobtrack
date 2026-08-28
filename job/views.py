from datetime import datetime
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Job


def home(request):
    jobs = Job.objects.all().order_by("-id")
    return render(request, "home.html", {"jobs": jobs})


def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, "%Y-%m-%d").date()


@require_POST
def add_job(request):
    company = request.POST.get("company")
    role = request.POST.get("role")
    location = request.POST.get("location", "")
    status = request.POST.get("status")
    applied_date = parse_date(request.POST.get("date"))

    job = Job.objects.create(
        company=company,
        role=role,
        location=location,
        status=status,
        applied_date=applied_date,
    )

    return JsonResponse({
        "id": job.id,
        "company": job.company,
        "role": job.role,
        "location": job.location,
        "status": job.status,
        "date": job.applied_date.strftime("%Y-%m-%d") if job.applied_date else "",
    })


@require_POST
def update_job(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    job.company = request.POST.get("company")
    job.role = request.POST.get("role")
    job.location = request.POST.get("location", "")
    job.status = request.POST.get("status")

    applied_date = parse_date(request.POST.get("date"))
    if applied_date:
        job.applied_date = applied_date

    job.save()

    return JsonResponse({
        "id": job.id,
        "company": job.company,
        "role": job.role,
        "location": job.location,
        "status": job.status,
        "date": job.applied_date.strftime("%Y-%m-%d") if job.applied_date else "",
    })


@require_POST
def delete_job(request, job_id):
    job = get_object_or_404(Job, id=job_id)
    job.delete()
    return JsonResponse({"success": True})