"use strict";

const WORKOUTS_KEY = "fitstreakWorkouts";
const HABITS_KEY = "fitstreakHabits";

const workoutForm = document.getElementById("workoutForm");
const exerciseInput = document.getElementById("exercise");
const durationInput = document.getElementById("duration");
const workoutList = document.getElementById("workoutList");
const workoutCount = document.getElementById("workoutCount");
const emptyWorkouts = document.getElementById("emptyWorkouts");

const historyDate = document.getElementById("historyDate");
const showAllWorkouts = document.getElementById("showAllWorkouts");
const totalMinutesSummary =
    document.getElementById("totalMinutesSummary");
const activityHeading =
    document.getElementById("activityHeading");

const habitCheckboxes = Array.from(
    document.querySelectorAll(".habit")
);

const habitCount = document.getElementById("habitCount");
const habitProgress = document.getElementById("habitProgress");
const habitSummary = document.getElementById("habitSummary");
const streakCount = document.getElementById("streakCount");

const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

let workouts = loadData(WORKOUTS_KEY, []);
let savedHabits = loadData(HABITS_KEY, {});

let editingWorkoutIndex = null;
let pendingDeleteIndex = null;
let previousFocusedElement = null;

let selectedHistoryDate;
let showingAllWorkouts = false;

/* DATA FUNCTIONS */

function loadData(key, fallback) {
    try {
        const savedData = localStorage.getItem(key);

        if (savedData === null) {
            return fallback;
        }

        return JSON.parse(savedData);
    } catch (error) {
        console.error(`Could not load ${key}:`, error);
        return fallback;
    }
}

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

selectedHistoryDate = getLocalDate();

/* WORKOUT STORAGE */

function saveWorkouts() {
    try {
        localStorage.setItem(
            WORKOUTS_KEY,
            JSON.stringify(workouts)
        );

        return true;
    } catch (error) {
        console.error("Could not save workouts:", error);
        alert("The workout could not be saved.");
        return false;
    }
}

/* DISPLAY WORKOUTS */

function createWorkoutElement(workout, originalIndex) {
    const item = document.createElement("li");
    item.className = "workout-item";

    const emoji = document.createElement("span");
    emoji.className = "workout-emoji";
    emoji.textContent = "🏃";
    emoji.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "workout-info";

    const name = document.createElement("strong");
    name.textContent = workout.exercise;

    const duration = document.createElement("small");

duration.textContent =
    `${workout.duration} minutes • ${workout.date}`;

    info.append(name, duration);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-workout";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
        editingWorkoutIndex = originalIndex;

        exerciseInput.value = workout.exercise;
        durationInput.value = workout.duration;

        exerciseInput.focus();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-workout";
    deleteButton.textContent = "×";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${workout.exercise}`
    );

    deleteButton.addEventListener("click", () => {
        openDeleteModal(originalIndex);
    });

    item.append(
        emoji,
        info,
        editButton,
        deleteButton
    );

    return item;
}

function displayWorkouts() {
    const today = getLocalDate();

    workoutList.replaceChildren();

    const visibleWorkouts = workouts
        .map((workout, index) => ({
            workout,
            index
        }))
        .filter(({ workout }) => {
            return showingAllWorkouts ||
                workout.date === selectedHistoryDate;
        });

    visibleWorkouts.forEach(({ workout, index }) => {
        workoutList.appendChild(
            createWorkoutElement(
                workout,
                index
            )
        );
    });

    const totalMinutes = visibleWorkouts.reduce(
        (total, { workout }) => {
            return total + Number(
                workout.duration || 0
            );
        },
        0
    );

    workoutCount.textContent =
        String(visibleWorkouts.length);

    totalMinutesSummary.textContent =
        `Total time: ${totalMinutes} minutes`;

    emptyWorkouts.hidden =
        visibleWorkouts.length > 0;

    if (showingAllWorkouts) {
        activityHeading.textContent =
            "All Activity";
    } else if (selectedHistoryDate === today) {
        activityHeading.textContent =
            "Today's Activity";
    } else {
        activityHeading.textContent =
            `Activity on ${selectedHistoryDate}`;
    }
}

/* ADD AND EDIT WORKOUTS */

workoutForm.addEventListener("submit", event => {
    event.preventDefault();

    const exercise = exerciseInput.value.trim();
    const duration = Number(
        durationInput.value
    );

    if (exercise === "") {
        alert("Please enter an exercise name.");
        exerciseInput.focus();
        return;
    }

    if (
        !Number.isFinite(duration) ||
        duration < 1 ||
        duration > 1440
    ) {
        alert(
            "Duration must be between 1 and 1440 minutes."
        );

        durationInput.focus();
        return;
    }

    const workoutDate =
        editingWorkoutIndex === null
            ? getLocalDate()
            : workouts[editingWorkoutIndex].date;

    const workoutData = {
        exercise,
        duration,
        date: workoutDate
    };

    if (editingWorkoutIndex === null) {
        workouts.push(workoutData);
    } else {
        workouts[editingWorkoutIndex] =
            workoutData;

        editingWorkoutIndex = null;
    }

    if (!saveWorkouts()) {
        return;
    }

    displayWorkouts();
    updateCurrentStreak();

    workoutForm.reset();
    exerciseInput.focus();
});

/* MODULE 3 - HISTORY FILTER */

historyDate.value = selectedHistoryDate;

historyDate.addEventListener("change", () => {
    selectedHistoryDate =
        historyDate.value || getLocalDate();

    showingAllWorkouts = false;
    displayWorkouts();
});

showAllWorkouts.addEventListener("click", () => {
    showingAllWorkouts = true;
    displayWorkouts();
});

/* DELETE WORKOUTS */

function openDeleteModal(index) {
    pendingDeleteIndex = index;
    previousFocusedElement = document.activeElement;

    deleteModal.hidden = false;
    confirmDelete.focus();
}

function closeDeleteModal() {
    deleteModal.hidden = true;
    pendingDeleteIndex = null;

    if (
        previousFocusedElement &&
        typeof previousFocusedElement.focus === "function"
    ) {
        previousFocusedElement.focus();
    }
}

cancelDelete.addEventListener(
    "click",
    closeDeleteModal
);

deleteModal.addEventListener("click", event => {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

confirmDelete.addEventListener("click", () => {
    if (
        pendingDeleteIndex === null ||
        pendingDeleteIndex < 0 ||
        pendingDeleteIndex >= workouts.length
    ) {
        closeDeleteModal();
        return;
    }

    const deletedWorkout = workouts.splice(
        pendingDeleteIndex,
        1
    )[0];

    if (!saveWorkouts()) {
        workouts.splice(
            pendingDeleteIndex,
            0,
            deletedWorkout
        );
    }

    displayWorkouts();
    updateCurrentStreak();
    closeDeleteModal();
});

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        !deleteModal.hidden
    ) {
        closeDeleteModal();
    }
});

/* DAILY HABITS */

function loadHabits() {
    const today = getLocalDate();

    habitCheckboxes.forEach((checkbox, index) => {
        checkbox.checked =
            savedHabits.date === today &&
            savedHabits[`habit${index}`] === true;
    });

    updateHabitProgress();
}

function saveHabits() {
    const updatedHabits = {
        date: getLocalDate()
    };

    habitCheckboxes.forEach((checkbox, index) => {
        updatedHabits[`habit${index}`] =
            checkbox.checked;
    });

    try {
        localStorage.setItem(
            HABITS_KEY,
            JSON.stringify(updatedHabits)
        );

        savedHabits = updatedHabits;
        return true;
    } catch (error) {
        console.error("Could not save habits:", error);
        alert("Your habit progress could not be saved.");
        return false;
    }
}

function updateHabitProgress() {
    const totalHabits =
        habitCheckboxes.length;

    const completedHabits =
        habitCheckboxes.filter(
            checkbox => checkbox.checked
        ).length;

    habitCount.textContent =
        `${completedHabits} / ${totalHabits}`;

    habitSummary.textContent =
        `${completedHabits} of ${totalHabits} completed`;

    const percentage = totalHabits > 0
        ? completedHabits / totalHabits * 100
        : 0;

    habitProgress.style.width =
        `${percentage}%`;

    habitProgress.setAttribute(
        "aria-valuenow",
        String(completedHabits)
    );
}

habitCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        saveHabits();
        updateHabitProgress();
    });
});

/* WORKOUT STREAK */

function updateCurrentStreak() {
    const workoutDates = new Set(
        workouts
            .filter(workout => workout.date)
            .map(workout => workout.date)
    );

    let currentDate = new Date();
    let streak = 0;

    while (
        workoutDates.has(
            getLocalDate(currentDate)
        )
    ) {
        streak++;

        currentDate.setDate(
            currentDate.getDate() - 1
        );
    }

    streakCount.textContent =
        `${streak} ${
            streak === 1 ? "day" : "days"
        }`;
}

/* START APPLICATION */

displayWorkouts();
loadHabits();
updateCurrentStreak();