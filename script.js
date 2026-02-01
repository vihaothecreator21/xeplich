// Hiển thị bảng lịch với ô note nhỏ cho từng ca
function displaySchedule(schedule) {
  // Tính toán ngày trong tuần (từ thứ 2 đến chủ nhật)
  const today = new Date();
  const currentDay = today.getDay(); // 0 = CN, 1 = T2, ...
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + daysUntilMonday);
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }

  let html = `<div style="margin-top: 30px;">
    <h2 style="color:#333; margin-bottom:20px; text-align:center;">
      📅 Lịch làm việc (${weekDates[0]
        .getDate()
        .toString()
        .padStart(2, "0")}/${(weekDates[0].getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${weekDates[0].getFullYear()} - ${weekDates[6]
    .getDate()
    .toString()
    .padStart(2, "0")}/${(weekDates[6].getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${weekDates[6].getFullYear()})
    </h2>
    <table class="schedule-table">
      <thead>
        <tr>
          <th>THỨ/ NGÀY</th>
          ${days.map((d) => `<th>${d}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="background: #fffbe6;">SÁNG (8:30 - 15:30)</td>
          ${days
            .map((day, dayIdx) => {
              const members = schedule[day].morning;
              return (
                `<td>` +
                (members.length > 0
                  ? members
                      .map((name) => {
                        const noteKey = `note-morning-${name}-${dayIdx}`;
                        const noteVal = localStorage.getItem(noteKey) || "";
                        return `<div style='margin:2px 0;padding:2px;background:#ffeaa7;border-radius:3px;'>
                      <div>${name}</div>
                      <input class='note-input' type='text' data-note-key='${noteKey}' value='${noteVal.replace(
                          /'/g,
                          "&#39;"
                        )}' oninput='saveNote(this)' autocomplete='off' style='margin-top:2px;width:90%;font-size:0.85em;padding:2px 4px;border:1px dashed #ffe082;border-radius:3px;background:#fffbe6;color:#a67c00;text-align:center;' />
                    </div>`;
                      })
                      .join("")
                  : "<div style='color:#999;'>-</div>") +
                `</td>`
              );
            })
            .join("")}
        </tr>
        <tr>
          <td>CHIỀU (15:00 - 22:00)</td>
          ${days
            .map((day, dayIdx) => {
              const members = schedule[day].evening;
              return (
                `<td>` +
                (members.length > 0
                  ? members
                      .map((name) => {
                        const noteKey = `note-evening-${name}-${dayIdx}`;
                        const noteVal = localStorage.getItem(noteKey) || "";
                        return `<div style='margin:2px 0;padding:2px;background:#74b9ff;color:white;border-radius:3px;'>
                      <div>${name}</div>
                      <input class='note-input' type='text' data-note-key='${noteKey}' value='${noteVal.replace(
                          /'/g,
                          "&#39;"
                        )}' oninput='saveNote(this)' autocomplete='off' style='margin-top:2px;width:90%;font-size:0.85em;padding:2px 4px;border:1px dashed #ffe082;border-radius:3px;background:#e3f2fd;color:#1565c0;text-align:center;' />
                    </div>`;
                      })
                      .join("")
                  : "<div style='color:#999;'>-</div>") +
                `</td>`
              );
            })
            .join("")}
        </tr>
        <tr>
          <td class="off-row">OFF</td>
          ${days
            .map((day) => {
              const members = schedule[day].off;
              return (
                `<td class="off-row">` +
                (members.length > 0
                  ? members
                      .map((name) => `<div style='margin:2px 0;'>${name}</div>`)
                      .join("")
                  : "<div>-</div>") +
                `</td>`
              );
            })
            .join("")}
        </tr>
      </tbody>
    </table>
  </div>`;
  document.getElementById("scheduleResult").innerHTML = html;
}
/***********************
 * 1. CONSTANTS
 ***********************/
const STORAGE_KEYS = {
  MEMBERS: "members",
  SHIFTS: "shiftState",
};

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const dayKeys = ["t2", "t3", "t4", "t5", "t6", "t7", "cn"];
const SHIFTS = ["morning", "evening", "off"];

/***********************
 * 2. STATE + STORAGE
 ***********************/
let members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS)) || [
  "Hảo",
  "Vy",
  "Hiếu",
  "Thùy",
  "Hương",
];

function saveMembers() {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

function saveShiftsToStorage() {
  const shiftState = {};

  members.forEach((member) => {
    shiftState[member] = {};
    dayKeys.forEach((dayKey) => {
      shiftState[member][dayKey] = {};
      SHIFTS.forEach((shift) => {
        shiftState[member][dayKey][shift] =
          document
            .querySelector(
              `[data-member="${member}"][data-day="${dayKey}"][data-shift="${shift}"]`
            )
            ?.classList.contains("selected") || false;
      });
    });
  });

  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shiftState));
}

function restoreShiftsFromStorage() {
  const shiftState = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS));
  if (!shiftState) return;

  members.forEach((member) => {
    dayKeys.forEach((dayKey) => {
      SHIFTS.forEach((shift) => {
        if (shiftState?.[member]?.[dayKey]?.[shift]) {
          document
            .querySelector(
              `[data-member="${member}"][data-day="${dayKey}"][data-shift="${shift}"]`
            )
            ?.classList.add("selected");
        }
      });
    });
  });
}

/***********************
 * 3. MEMBER EDIT
 ***********************/
function editMemberName(index) {
  const oldName = members[index];
  const input = document.createElement("input");
  input.value = oldName;
  input.className = "member-name-input";
  const cell = document.querySelector(`[data-member-index="${index}"]`);
  cell.replaceChildren(input);
  input.focus();

  input.onblur = input.onkeydown = (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      const newName = input.value.trim() || oldName;
      if (newName !== oldName) {
        // Chuyển dữ liệu ca làm
        const shiftState =
          JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS)) || {};
        if (shiftState[oldName]) {
          shiftState[newName] = shiftState[oldName];
          delete shiftState[oldName];
          localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shiftState));
        }
        // Chuyển note
        for (let i = 0; i < 7; i++) {
          ["morning", "evening"].forEach((shift) => {
            const oldKey = `note-${shift}-${oldName}-${i}`;
            const newKey = `note-${shift}-${newName}-${i}`;
            const val = localStorage.getItem(oldKey);
            if (val !== null) {
              localStorage.setItem(newKey, val);
              localStorage.removeItem(oldKey);
            }
          });
        }
      }
      members[index] = newName;
      saveMembers();
      reloadGrid();
    }
  };
}

/***********************
 * 4. GRID RENDER
 ***********************/
function initializeScheduleGrid() {
  const grid = document.getElementById("scheduleGrid");
  grid.innerHTML = "";

  members.forEach((member, index) => {
    grid.appendChild(renderMemberCell(member, index));

    dayKeys.forEach((dayKey) => {
      grid.appendChild(renderDayCell(member, dayKey));
    });
  });
}

function renderMemberCell(member, index) {
  const div = document.createElement("div");
  div.className = "member-name";
  div.textContent = member;
  div.dataset.memberIndex = index;
  div.onclick = () => editMemberName(index);
  return div;
}

function renderDayCell(member, dayKey) {
  const cell = document.createElement("div");
  cell.className = "day-cell";

  const container = document.createElement("div");
  container.className = "shift-buttons";

  SHIFTS.forEach((shift) => {
    const btn = document.createElement("button");
    btn.className = `shift-btn ${shift}`;
    btn.textContent =
      shift === "morning" ? "Sáng" : shift === "evening" ? "Chiều" : "Off";
    btn.dataset.member = member;
    btn.dataset.day = dayKey;
    btn.dataset.shift = shift;
    btn.onclick = () => toggleShift(member, dayKey, shift);
    container.appendChild(btn);
  });

  cell.appendChild(container);
  return cell;
}

/***********************
 * 5. SHIFT LOGIC
 ***********************/
function toggleShift(member, day, shift) {
  const buttons = document.querySelectorAll(
    `[data-member="${member}"][data-day="${day}"]`
  );

  if (shift === "off") {
    buttons.forEach((b) => b.classList.remove("selected"));
    getBtn(member, day, "off")?.classList.add("selected");
  } else {
    getBtn(member, day, "off")?.classList.remove("selected");
    getBtn(member, day, shift)?.classList.toggle("selected");
  }

  saveShiftsToStorage();
}

function getBtn(member, day, shift) {
  return document.querySelector(
    `[data-member="${member}"][data-day="${day}"][data-shift="${shift}"]`
  );
}

/***********************
 * 6. SCHEDULE GENERATE
 ***********************/
function generateSchedule() {
  const schedule = {};

  days.forEach((day, idx) => {
    const key = dayKeys[idx];
    schedule[day] = { morning: [], evening: [], off: [] };

    members.forEach((member) => {
      const hasMorning = getBtn(member, key, "morning")?.classList.contains(
        "selected"
      );
      const hasEvening = getBtn(member, key, "evening")?.classList.contains(
        "selected"
      );

      if (hasMorning) schedule[day].morning.push(member);
      if (hasEvening) schedule[day].evening.push(member);
      if (!hasMorning && !hasEvening) schedule[day].off.push(member);
    });
  });

  displaySchedule(schedule);
}

/***********************
 * 7. NOTE HANDLER
 ***********************/
function saveNote(input) {
  localStorage.setItem(input.dataset.noteKey, input.value);
  // Chỉ gọi generateSchedule khi blur hoặc Enter
  if (
    window.event &&
    (window.event.type === "blur" ||
      (window.event.type === "keydown" && window.event.key === "Enter"))
  ) {
    generateSchedule();
  }
}

/***********************
 * 8. INIT
 ***********************/
function reloadGrid() {
  initializeScheduleGrid();
  restoreShiftsFromStorage();
}

document.addEventListener("DOMContentLoaded", reloadGrid);

// 9. RESET FUNCTION
function resetAll() {
  if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ lịch và ghi chú?")) {
    // Xóa dữ liệu localStorage liên quan
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    // Xóa tất cả note
    Object.keys(localStorage)
      .filter((k) => k.startsWith("note-"))
      .forEach((k) => localStorage.removeItem(k));
    // Khôi phục thành viên mặc định
    members = ["Hảo", "Vy", "Hiếu", "Thùy", "Hương"];
    saveMembers();
    reloadGrid();
    document.getElementById("scheduleResult").innerHTML = "";
  }
}
