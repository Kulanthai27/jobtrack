from django.db import models
 
 
class Job(models.Model):
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=50, default="Applied")
    applied_date = models.DateField(null=True, blank=True)
 
    def __str__(self):
        return f"{self.company} - {self.role}"
 
