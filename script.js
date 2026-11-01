
"use strict";

/* ==========================================
   FITSTREAK - WORKOUTS, HABITS & STREAKS
   Existing localStorage keys are preserved.
   ========================================== */

const WORKOUTS_KEY = "fitstreakWorkouts";
const HABITS_KEY = "fitstreakHabits";

const workoutForm = document.getElementById("workoutForm");
const exerciseInput = document.getElementById("exercise");
const durationInput = document.getElementById("duration");
const workoutList = document.getElementById("workoutList");
const workoutCount = document.getElementById("workoutCount");
const emptyWorkouts = document.getElementById("emptyWorkouts");

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

let pendingDeleteIndex = null;
let previousFocusedElement = null;

/* ==========================================
   DATE HELPERS
   ========================================== */

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return getLocalDate(yesterday);
}

function getDateDifference(dateA, dateB) {
    const [yearA, monthA, dayA] = dateA.split("-").map(Number);
    const [yearB, monthB, dayB] = dateB.split("-").map(Number);

    const utcA = Date.UTC(yearA, monthA - 1, dayA);
    const utcB = Date.UTC(yearB, monthB - 1, dayB);

    return Math.round((utcB - utcA) / 86400000);
}

/* ==========================================
   SAFE STORAGE HELPERS
   ========================================== */

function readStoredJSON(key, fallback) {
    try {
        const savedValue = localStorage.getItem(key);

        if (savedValue === null) {
            return fallback;
        }

        return JSON.parse(savedValue);
    } catch (error) {
        console.error(`Could not read ${key}:`, error);
        return fallback;
    }
}

let workouts = readStoredJSON(WORKOUTS_KEY, []);

if (!Array.isArray(workouts)) {
    console.error("Saved workout data is not an array.");
    workouts = [];
}

/*
 * Do not erase localStorage if reading fails.
 * Existing workout objects and their dates are retained.
 */

function saveWorkouts() {
    try {
        localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
        return true;
    } catch (error) {
        console.error("Could not save workouts:", error);
        alert("Your workout could not be saved. Please check browser storage.");
        return false;
    }
}

/* ==========================================
   WORKOUT DISPLAY
   ========================================== */

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
    name.textContent = workout.exercise || "Workout";

    const duration = document.createElement("small");
    duration.textContent = `${workout.duration} minutes`;

    info.append(name, duration);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-workout";
    deleteButton.textContent = "×";
    deleteButton.setAttribute(
        "aria-label",
        `Delete ${workout.exercise || "workout"}`
    );

    deleteButton.addEventListener("click", () => {
        openDeleteModal(originalIndex);
    });

    item.append(emoji, info, deleteButton);

    return item;
}

function displayWorkouts() {
    const today = getLocalDate();

    workoutList.replaceChildren();

    const todaysWorkouts = workouts
        .map((workout, index) => ({ workout, index }))
        .filter(({ workout }) => workout.date === today);

    todaysWorkouts.forEach(({ workout, index }) => {
        workoutList.appendChild(
            createWorkoutElement(workout, index)
        );
    });

    workoutCount.textContent = String(todaysWorkouts.length);
    emptyWorkouts.hidden = todaysWorkouts.length > 0;
}

/* ==========================================
   ADD WORKOUT
   ========================================== */

workoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const exercise = exerciseInput.value.trim();
    const duration = Number(durationInput.value);

    if (!exercise) {
        exerciseInput.focus();
        return;
    }

    if (!Number.isFinite(duration) || duration < 1 || duration > 1440) {
        durationInput.focus();
        alert("Please enter a duration between 1 and 1440 minutes.");
        return;
    }

    const newWorkout = {
        exercise,
        duration,
        date: getLocalDate()
    };

    workouts.push(newWorkout);

    if (!saveWorkouts()) {
        workouts.pop();
        return;
    }

    displayWorkouts();
    updateCurrentStreak();

    workoutForm.reset();
    exerciseInput.focus();
});

/* ==========================================
   DELETE CONFIRMATION MODAL
   ========================================== */

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

cancelDelete.addEventListener("click", closeDeleteModal);

deleteModal.addEventListener("click", (event) => {
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

    const removedWorkout = workouts.splice(pendingDeleteIndex, 1)[0];

    if (!saveWorkouts()) {
        workouts.splice(pendingDeleteIndex, 0, removedWorkout);
        displayWorkouts();
        closeDeleteModal();
        return;
    }

    displayWorkouts();
    updateCurrentStreak();
    closeDeleteModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteModal.hidden) {
        closeDeleteModal();
    }
});

/* ==========================================
   DAILY HABITS
   ========================================== */

/*
 * Supports the existing habit storage format:
 * {
 *   "date": "YYYY-MM-DD",
 *   "habit0": true,
 *   "habit1": false,
 *   "habit2": true
 * }
 *
 * The same storage key is kept for compatibility.
 */

let savedHabits = readStoredJSON(HABITS_KEY, {});

if (
    !savedHabits ||
    typeof savedHabits !== "object" ||
    Array.isArray(savedHabits)
) {
    savedHabits = {};
}

function loadHabits() {
    const today = getLocalDate();

    habitCheckboxes.forEach((checkbox, index) => {
        const key = `habit${index}`;

        checkbox.checked =
            savedHabits.date === today &&
            savedHabits[key] === true;
    });

    updateHabitProgress();
}

function saveHabits() {
    const today = getLocalDate();
    const previousHabits = { ...savedHabits };

    const updatedHabits = {
        date: today
    };

    habitCheckboxes.forEach((checkbox, index) => {
        updatedHabits[`habit${index}`] = checkbox.checked;
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

        savedHabits = previousHabits;
        alert("Your habit progress could not be saved. Please check browser storage.");
        return false;
    }
}

function updateHabitProgress() {
    const totalHabits = habitCheckboxes.length;
    const completedHabits = habitCheckboxes.filter(
        checkbox => checkbox.checked
    ).length;

    habitCount.textContent = `${completedHabits} / ${totalHabits}`;
    habitSummary.textContent =
        `${completedHabits} of ${totalHabits} completed`;

    const percentage = totalHabits > 0
        ? (completedHabits / totalHabits) * 100
        : 0;

    habitProgress.style.width = `${percentage}%`;
    habitProgress.setAttribute("aria-valuenow", String(completedHabits));
}

habitCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const previousState = checkbox.checked;

        if (!saveHabits()) {
            checkbox.checked = !previousState;
        }

        updateHabitProgress();
    });
});

/* ==========================================
   CURRENT WORKOUT STREAK
   ========================================== */

function updateCurrentStreak() {
    const workoutDates = new Set(
        workouts
            .filter(workout =>
                workout &&
                typeof workout.date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(workout.date)
            )
            .map(workout => workout.date)
    );

    const today = getLocalDate();

    /*
     * If no workout was completed today, continue checking
     * from yesterday so a current streak isn't lost immediately.
     */

    let checkDate = workoutDates.has(today)
        ? today
        : getYesterdayDate();

    let streak = 0;

    while (workoutDates.has(checkDate)) {
        streak++;

        const [year, month, day] = checkDate.split("-").map(Number);
        const previousDate = new Date(year, month - 1, day);

        previousDate.setDate(previousDate.getDate() - 1);

        checkDate = getLocalDate(previousDate);
    }

    streakCount.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
}

/* ==========================================
   INITIALIZE DASHBOARD
   ========================================== */

displayWorkouts();
loadHabits();
updateCurrentStreak();
s