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
const historyViewBadge =
    document.getElementById("historyViewBadge");

const habitCheckboxes = [
    ...document.querySelectorAll(".habit")
];

const habitCount = document.getElementById("habitCount");
const habitProgress = document.getElementById("habitProgress");
const habitSummary = document.getElementById("habitSummary");
const streakCount = document.getElementById("streakCount");

let workouts = loadData(WORKOUTS_KEY, []);
let savedHabits = loadData(HABITS_KEY, {});

let editingWorkoutIndex = null;
let selectedHistoryDate = getLocalDate();
let showingAllWorkouts = false;

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error("Could not load data:", error);
        return fallback;
    }
}

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function saveWorkouts() {
    try {
        localStorage.setItem(
            WORKOUTS_KEY,
            JSON.stringify(workouts)
        );

        return true;
    } catch (error) {
        alert("The workout could not be saved.");
        return false;
    }
}

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

    const details = document.createElement("small");
    details.textContent =
        `${workout.duration} minutes • ${workout.date}`;

    info.append(name, details);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-workout";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
        editingWorkoutIndex = originalIndex;
        exerciseInput.value = workout.exercise;
        durationInput.value = workout.duration;

        document.querySelector(".primary-button").textContent =
            "Update Workout";

        exerciseInput.focus();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-workout";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
        "aria-label",
        `Delete ${workout.exercise}`
    );

    deleteButton.addEventListener("click", () => {
        const confirmed = confirm(
            `Delete "${workout.exercise}"?`
        );

        if (!confirmed) {
            return;
        }

        workouts.splice(originalIndex, 1);
        saveWorkouts();
        displayWorkouts();
        updateStreak();
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

    const visibleWorkouts = workouts
        .map((workout, index) => ({
            workout,
            index
        }))
        .filter(({ workout }) => {
            return showingAllWorkouts ||
                workout.date === selectedHistoryDate;
        });

    workoutList.replaceChildren();

    visibleWorkouts.forEach(({ workout, index }) => {
        workoutList.appendChild(
            createWorkoutElement(workout, index)
        );
    });

    const totalMinutes = visibleWorkouts.reduce(
        (total, item) => {
            return total + Number(item.workout.duration || 0);
        },
        0
    );

    const todayCount = workouts.filter(workout => {
        return workout.date === today;
    }).length;

    workoutCount.textContent = todayCount;
    totalMinutesSummary.textContent =
        `Total time: ${totalMinutes} minutes`;

    emptyWorkouts.hidden =
        visibleWorkouts.length > 0;

    if (showingAllWorkouts) {
        activityHeading.textContent = "All Activity";
        historyViewBadge.textContent = "ALL DATES";
        showAllWorkouts.textContent = "View selected date";
    } else if (selectedHistoryDate === today) {
        activityHeading.textContent = "Today's Activity";
        historyViewBadge.textContent = "TODAY";
        showAllWorkouts.textContent = "Show all";
    } else {
        activityHeading.textContent =
            `Activity on ${selectedHistoryDate}`;
        historyViewBadge.textContent = "SELECTED DATE";
        showAllWorkouts.textContent = "Show all";
    }

    showAllWorkouts.setAttribute(
        "aria-pressed",
        String(showingAllWorkouts)
    );
}

workoutForm.addEventListener("submit", event => {
    event.preventDefault();

    const exercise = exerciseInput.value.trim();
    const duration = Number(durationInput.value);

    if (!exercise) {
        alert("Please enter an exercise name.");
        exerciseInput.focus();
        return;
    }

    if (
        !Number.isFinite(duration) ||
        duration < 1 ||
        duration > 1440
    ) {
        alert("Duration must be between 1 and 1440 minutes.");
        durationInput.focus();
        return;
    }

    const workout = {
        exercise,
        duration,
        date: editingWorkoutIndex === null
            ? getLocalDate()
            : workouts[editingWorkoutIndex].date
    };

    if (editingWorkoutIndex === null) {
        workouts.push(workout);
    } else {
        workouts[editingWorkoutIndex] = workout;
        editingWorkoutIndex = null;
    }

    if (!saveWorkouts()) {
        return;
    }

    workoutForm.reset();
    document.querySelector(".primary-button").textContent =
        "Add Workout";

    displayWorkouts();
    updateStreak();
    exerciseInput.focus();
});

historyDate.value = selectedHistoryDate;

historyDate.addEventListener("change", () => {
    selectedHistoryDate =
        historyDate.value || getLocalDate();

    showingAllWorkouts = false;
    displayWorkouts();
});

showAllWorkouts.addEventListener("click", () => {
    showingAllWorkouts = !showingAllWorkouts;
    displayWorkouts();
});

function saveHabits() {
    const habitData = {
        date: getLocalDate()
    };

    habitCheckboxes.forEach((checkbox, index) => {
        habitData[`habit${index}`] = checkbox.checked;
    });

    localStorage.setItem(
        HABITS_KEY,
        JSON.stringify(habitData)
    );

    savedHabits = habitData;
}

function updateHabitProgress() {
    const completed = habitCheckboxes.filter(
        checkbox => checkbox.checked
    ).length;

    const total = habitCheckboxes.length;
    const percentage = total
        ? completed / total * 100
        : 0;

    habitCount.textContent = `${completed} / ${total}`;
    habitSummary.textContent =
        `${completed} of ${total} completed`;
    habitProgress.style.width = `${percentage}%`;
}

function loadHabits() {
    const today = getLocalDate();

    habitCheckboxes.forEach((checkbox, index) => {
        checkbox.checked =
            savedHabits.date === today &&
            savedHabits[`habit${index}`] === true;
    });

    updateHabitProgress();
}

habitCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        saveHabits();
        updateHabitProgress();
    });
});

function updateStreak() {
    const workoutDates = new Set(
        workouts.map(workout => workout.date)
    );

    const date = new Date();
    let streak = 0;

    while (workoutDates.has(getLocalDate(date))) {
        streak++;

        date.setDate(date.getDate() - 1);
    }

    streakCount.textContent =
        `${streak} ${streak === 1 ? "day" : "days"}`;
}

displayWorkouts();
loadHabits();
updateStreak();