// ========================================
// Job Tracker
// ========================================

// Get HTML elements
const jobForm = document.getElementById("jobForm");
const jobContainer = document.getElementById("jobContainer");
const submitBtn = document.getElementById("submitBtn");

const totalJobs = document.getElementById("totalJobs");
const appliedJobs = document.getElementById("appliedJobs");
const interviewJobs = document.getElementById("interviewJobs");
const selectedJobs = document.getElementById("selectedJobs");
const rejectedJobs = document.getElementById("rejectedJobs");
const applicationCount = document.getElementById("applicationCount");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortJobs = document.getElementById("sortJobs");


// ========================================
// Store all jobs
// ========================================

let jobs = djangoJobs;


// ========================================
// Store the job currently being edited
// ========================================

let editingJob = null;


// ========================================
// CSRF helper
// ========================================

function getCsrfToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}


// ========================================
// Update Dashboard
// ========================================

function updateDashboard() {

    totalJobs.textContent = jobs.length;

    let applied = 0;
    let interview = 0;
    let selected = 0;
    let rejected = 0;

    for (let job of jobs) {

        if (job.status === "Applied") applied++;
        if (job.status === "Interview") interview++;
        if (job.status === "Selected") selected++;
        if (job.status === "Rejected") rejected++;

    }

    appliedJobs.textContent = applied;
    interviewJobs.textContent = interview;
    selectedJobs.textContent = selected;
    rejectedJobs.textContent = rejected;

}


// ========================================
// Display Jobs
// ========================================

function displayJobs(jobList = jobs) {

    jobContainer.innerHTML = "";

    applicationCount.textContent = `${jobList.length} Applications`;

    if (jobList.length === 0) {

        jobContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h5 class="text-muted">No applications found</h5>
                <p class="text-muted">Add a job application to get started.</p>
            </div>
        `;

    }

    jobList.forEach(function (job) {
        createJobCard(job);
    });

    updateDashboard();

}


// ========================================
// Status Badge Class
// ========================================

function getStatusClass(status) {

    if (status === "Applied") return "text-bg-warning";
    if (status === "Interview") return "text-bg-info";
    if (status === "Selected") return "text-bg-success";
    if (status === "Rejected") return "text-bg-danger";

    return "text-bg-secondary";

}


// ========================================
// Create Job Card
// ========================================

function createJobCard(job) {

    const jobCard = document.createElement("div");

    jobCard.className = "col-md-6 col-lg-4 job-card";

    jobCard.innerHTML = `

        <div class="card h-100 shadow-sm">

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-start">

                    <div>
                        <h5 class="card-title">${job.company}</h5>
                        <p class="card-text text-muted role">${job.role}</p>
                        ${job.location ? `<p class="card-text text-muted small">${job.location}</p>` : ""}
                    </div>

                    <span class="badge ${getStatusClass(job.status)}">
                        ${job.status}
                    </span>

                </div>

                <hr>

                <p class="card-text application-date">
                    <strong>Applied:</strong> ${job.date}
                </p>

                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary edit-btn">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
                </div>

            </div>

        </div>

    `;

    jobContainer.appendChild(jobCard);


    // ========================================
    // DELETE
    // ========================================

    const deleteButton = jobCard.querySelector(".delete-btn");

    deleteButton.addEventListener("click", function () {

        fetch(`/delete-job/${job.id}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {

            if (data.success) {
                jobs = jobs.filter(function (item) {
                    return item.id !== job.id;
                });

                displayJobs();
            }

        })
        .catch(error => {
            console.error("Delete error:", error);
        });

    });


    // ========================================
    // EDIT
    // ========================================

    const editButton = jobCard.querySelector(".edit-btn");

    editButton.addEventListener("click", function () {

        document.getElementById("company").value = job.company;
        document.getElementById("role").value = job.role;
        document.getElementById("location").value = job.location || "";
        document.getElementById("date").value = job.date;
        document.getElementById("status").value = job.status;

        editingJob = job;

        submitBtn.textContent = "Update Job";

        jobForm.scrollIntoView({ behavior: "smooth" });

    });

}


// ========================================
// Form Submit
// ========================================

jobForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const company = document.getElementById("company").value;
    const role = document.getElementById("role").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;

    const formData = new FormData();
    formData.append("company", company);
    formData.append("role", role);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("status", status);

    // ========================================
    // UPDATE EXISTING JOB
    // ========================================

    if (editingJob !== null) {

        fetch(`/update-job/${editingJob.id}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCsrfToken()
            },
            body: formData
        })
        .then(response => response.json())
        .then(updatedJob => {

            const index = jobs.findIndex(item => item.id === updatedJob.id);
            if (index !== -1) {
                jobs[index] = updatedJob;
            }

            editingJob = null;
            submitBtn.textContent = "Add Job";

            jobForm.reset();
            displayJobs();

        })
        .catch(error => {
            console.error("Update error:", error);
        });

        return;

    }

    // ========================================
    // ADD NEW JOB
    // ========================================

    fetch("/add-job/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCsrfToken()
        },
        body: formData
    })
    .then(response => response.json())
    .then(job => {

        jobs.push(job);

        jobForm.reset();
        displayJobs();

    })
    .catch(error => {
        console.error("Add error:", error);
    });

});


// ========================================
// Search + Filter + Sort
// ========================================

function filterJobs() {

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedSort = sortJobs.value;

    let filteredJobs = jobs.filter(function (job) {

        const matchesSearch =
            job.company.toLowerCase().includes(searchText) ||
            job.role.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            job.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    if (selectedSort === "newest") {
        filteredJobs.sort(function (a, b) { return b.id - a.id; });
    }

    if (selectedSort === "oldest") {
        filteredJobs.sort(function (a, b) { return a.id - b.id; });
    }

    if (selectedSort === "company") {
        filteredJobs.sort(function (a, b) { return a.company.localeCompare(b.company); });
    }

    displayJobs(filteredJobs);

}


// ========================================
// Events
// ========================================

searchInput.addEventListener("input", filterJobs);
statusFilter.addEventListener("change", filterJobs);
sortJobs.addEventListener("change", filterJobs);


// ========================================
// Load Jobs When Page Opens
// ========================================

displayJobs();