"use strict";

const WORKOUTS_KEY = "fitstreakWorkouts";
const HABITS_KEY = "fitstreakHabits";
const HABIT_HISTORY_KEY = "fitstreakHabitHistory";

const workoutForm = document.getElementById("workoutForm");
const exerciseInput = document.getElementById("exercise");
const durationInput = document.getElementById("duration");
const workoutList = document.getElementById("workoutList");
const workoutCount = document.getElementById("workoutCount");
const emptyWorkouts = document.getElementById("emptyWorkouts");

const historyDate = document.getElementById("historyDate");
const showAllWorkouts = document.getElementById("showAllWorkouts");
const totalMinutesSummary = document.getElementById("totalMinutesSummary");
const activityHeading = document.getElementById("activityHeading");
const historyViewBadge = document.getElementById("historyViewBadge");

const habitCheckboxes = [
    ...document.querySelectorAll(".habit")
];

const habitCount = document.getElementById("habitCount");
const habitProgress = document.getElementById("habitProgress");
const habitSummary = document.getElementById("habitSummary");
const streakCount = document.getElementById("streakCount");

const weeklyWorkoutCount =
    document.getElementById("weeklyWorkoutCount");

const weeklyMinutes =
    document.getElementById("weeklyMinutes");

const weeklyHabitCount =
    document.getElementById("weeklyHabitCount");

const weeklyChart =
    document.getElementById("weeklyChart");

const habitHistoryList =
    document.getElementById("habitHistoryList");

let workouts = loadData(WORKOUTS_KEY, []);
let savedHabits = loadData(HABITS_KEY, {});
let habitHistory = loadData(HABIT_HISTORY_KEY, {});

let editingWorkoutIndex = null;
let selectedHistoryDate = getLocalDate();
let showingAllWorkouts = false;

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(`Could not load ${key}:`, error);
        return fallback;
    }
}

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
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
        `${workout.duration} minutes • ${formatDate(workout.date)}`;

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
        if (!confirm(`Delete "${workout.exercise}"?`)) {
            return;
        }

        workouts.splice(originalIndex, 1);
        saveWorkouts();
        displayWorkouts();
        updateStreak();
        updateWeeklyProgress();
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
            `Activity on ${formatDate(selectedHistoryDate)}`;

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
    updateWeeklyProgress();

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

function getTodayHabitRecord() {
    const today = getLocalDate();

    if (habitHistory[today]) {
        return habitHistory[today];
    }

    if (savedHabits.date === today) {
        return savedHabits;
    }

    return {};
}

function saveHabits() {
    const today = getLocalDate();

    const habitRecord = {
        date: today
    };

    habitCheckboxes.forEach((checkbox, index) => {
        habitRecord[`habit${index}`] =
            checkbox.checked;
    });

    habitHistory[today] = habitRecord;
    savedHabits = habitRecord;

    localStorage.setItem(
        HABITS_KEY,
        JSON.stringify(habitRecord)
    );

    localStorage.setItem(
        HABIT_HISTORY_KEY,
        JSON.stringify(habitHistory)
    );
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

    habitProgress.style.width =
        `${percentage}%`;
}

function loadHabits() {
    const todayRecord = getTodayHabitRecord();

    habitCheckboxes.forEach((checkbox, index) => {
        checkbox.checked =
            todayRecord[`habit${index}`] === true;
    });

    updateHabitProgress();
}

habitCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        saveHabits();
        updateHabitProgress();
        updateWeeklyProgress();
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

function getStartOfWeek(date = new Date()) {
    const result = new Date(date);
    const day = result.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}

function getWeekDates() {
    const start = getStartOfWeek();

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return getLocalDate(date);
    });
}

function getHabitCompletedCount(record) {
    return habitCheckboxes.filter((_, index) => {
        return record && record[`habit${index}`] === true;
    }).length;
}

function updateWeeklyProgress() {
    const weekDates = getWeekDates();

    const weekWorkouts = workouts.filter(workout => {
        return weekDates.includes(workout.date);
    });

    const totalMinutes = weekWorkouts.reduce(
        (total, workout) => {
            return total + Number(workout.duration || 0);
        },
        0
    );

    const totalHabits = weekDates.reduce(
        (total, date) => {
            return total + getHabitCompletedCount(
                habitHistory[date]
            );
        },
        0
    );

    weeklyWorkoutCount.textContent =
        weekWorkouts.length;

    weeklyMinutes.textContent =
        totalMinutes;

    weeklyHabitCount.textContent =
        totalHabits;

    weeklyChart.replaceChildren();

    const minutesByDate = weekDates.map(date => {
        return workouts
            .filter(workout => workout.date === date)
            .reduce((total, workout) => {
                return total + Number(workout.duration || 0);
            }, 0);
    });

    const highestValue = Math.max(...minutesByDate, 1);

    weekDates.forEach((date, index) => {
        const column = document.createElement("div");
        column.className = "chart-column";

        const value = document.createElement("span");
        value.className = "chart-value";
        value.textContent = minutesByDate[index];

        const track = document.createElement("div");
        track.className = "chart-track";

        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.height =
            `${minutesByDate[index] / highestValue * 100}%`;

        const label = document.createElement("small");
        label.textContent =
            new Date(`${date}T00:00:00`)
                .toLocaleDateString(undefined, {
                    weekday: "short"
                });

        track.appendChild(bar);
        column.append(value, track, label);
        weeklyChart.appendChild(column);
    });

    updateHabitHistory();
}

function updateHabitHistory() {
    const dates = Array.from(
        { length: 7 },
        (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - index);
            return getLocalDate(date);
        }
    );

    habitHistoryList.replaceChildren();

    dates.forEach(date => {
        const record = habitHistory[date] || {};
        const completed = getHabitCompletedCount(record);

        const item = document.createElement("li");

        const dateText = document.createElement("span");
        dateText.textContent =
            date === getLocalDate()
                ? "Today"
                : formatDate(date);

        const progressText = document.createElement("strong");
        progressText.textContent =
            `${completed} / ${habitCheckboxes.length}`;

        item.append(dateText, progressText);
        habitHistoryList.appendChild(item);
    });
}

displayWorkouts();
loadHabits();
updateStreak();
updateWeeklyProgress();