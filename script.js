const members = ["Hảo", "Vy", "Hiếu", "Thùy", "Hương"];
const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const dayKeys = ["t2", "t3", "t4", "t5", "t6", "t7", "cn"];

// ================== Khởi tạo giao diện ==================
function initializeScheduleGrid() {
  const grid = document.getElementById("scheduleGrid");

  members.forEach((member) => {
    const memberDiv = document.createElement("div");
    memberDiv.className = "member-name";
    memberDiv.textContent = member;
    grid.appendChild(memberDiv);

    dayKeys.forEach((dayKey) => {
      const dayCell = document.createElement("div");
      dayCell.className = "day-cell";

      const shiftButtons = document.createElement("div");
      shiftButtons.className = "shift-buttons";

      ["morning", "evening", "off"].forEach((shift) => {
        const btn = document.createElement("button");
        btn.className = `shift-btn ${shift}`;
        btn.textContent =
          shift === "morning"
            ? "Sáng"
            : shift === "evening"
            ? "Chiều"
            : "Off";
        btn.setAttribute("data-member", member);
        btn.setAttribute("data-day", dayKey);
        btn.setAttribute("data-shift", shift);
        btn.onclick = () => toggleShift(member, dayKey, shift);
        shiftButtons.appendChild(btn);
      });

      dayCell.appendChild(shiftButtons);
      grid.appendChild(dayCell);
    });
  });
}

// ================== Toggle ca ==================
function toggleShift(member, day, shift) {
  const buttons = document.querySelectorAll(
    `[data-member="${member}"][data-day="${day}"]`
  );

  if (shift === "off") {
    buttons.forEach((btn) => btn.classList.remove("selected"));
    document
      .querySelector(`[data-member="${member}"][data-day="${day}"][data-shift="off"]`)
      .classList.add("selected");
  } else {
    document
      .querySelector(`[data-member="${member}"][data-day="${day}"][data-shift="off"]`)
      .classList.remove("selected");

    const targetBtn = document.querySelector(
      `[data-member="${member}"][data-day="${day}"][data-shift="${shift}"]`
    );
    targetBtn.classList.toggle("selected");
  }
}

// ================== Reset ==================
function resetAll() {
  document.querySelectorAll(".shift-btn").forEach((btn) => btn.classList.remove("selected"));
  document.getElementById("scheduleResult").innerHTML = "";
  localStorage.removeItem("lastSchedule");
}

// ================== Tạo lịch ==================
function generateSchedule() {
  const scheduleData = {};

  members.forEach((member) => {
    scheduleData[member] = { morning: [], evening: [] };
    dayKeys.forEach((dayKey, index) => {
      const morningBtn = document.querySelector(
        `[data-member="${member}"][data-day="${dayKey}"][data-shift="morning"]`
      );
      const eveningBtn = document.querySelector(
        `[data-member="${member}"][data-day="${dayKey}"][data-shift="evening"]`
      );

      if (morningBtn.classList.contains("selected")) scheduleData[member].morning.push(days[index]);
      if (eveningBtn.classList.contains("selected")) scheduleData[member].evening.push(days[index]);
    });
  });

  const weeklySchedule = {};
  days.forEach((day) => {
    const morningMembers = [];
    const eveningMembers = [];
    const offMembers = [];

    members.forEach((member) => {
      const hasMorning = scheduleData[member].morning.includes(day);
      const hasEvening = scheduleData[member].evening.includes(day);

      if (hasMorning) morningMembers.push({ name: member });
      if (hasEvening) eveningMembers.push({ name: member });
      if (!hasMorning && !hasEvening) offMembers.push({ name: member });
    });

    weeklySchedule[day] = { morningMembers, eveningMembers, offMembers };
  });

  displaySchedule(weeklySchedule);
}

// ================== Hiển thị lịch ==================
function displaySchedule(schedule) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = CN, 1 = T2
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + daysUntilMonday);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }

  let html = `<div style="margin-top:30px;">
    <h2 style="text-align:center;">📅 Lịch làm SVH (${weekDates[0].getDate()}/${weekDates[0].getMonth()+1} - ${weekDates[6].getDate()}/${weekDates[6].getMonth()+1})</h2>
    <table class="schedule-table">
      <thead>
        <tr><th>THỨ/ NGÀY</th>${days.map(day => `<th>${day}</th>`).join("")}</tr>
        <tr><th></th>${weekDates.map(d => `<th>${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</th>`).join("")}</tr>
      </thead>
      <tbody>
        <tr>
          <td>SÁNG</td>
          ${days.map(day => {
            const names = schedule[day].morningMembers.map(m=>m.name);
            return `<td>${names.length>0?names.join(", "):"-"}</td>`;
          }).join("")}
        </tr>
        <tr>
          <td>CHIỀU</td>
          ${days.map(day => {
            const names = schedule[day].eveningMembers.map(m=>m.name);
            return `<td>${names.length>0?names.join(", "):"-"}</td>`;
          }).join("")}
        </tr>
        <tr>
          <td>OFF</td>
          ${days.map(day => {
            const names = schedule[day].offMembers.map(m=>m.name);
            return `<td>${names.length>0?names.join(", "):"-"}</td>`;
          }).join("")}
        </tr>
      </tbody>
    </table>
  </div>`;

  document.getElementById("scheduleResult").innerHTML = html;
}

// ================== Lưu lịch vào LocalStorage ==================
function saveSchedule() {
  const scheduleHTML = document.getElementById("scheduleResult").innerHTML;
  if (scheduleHTML.trim() !== "") {
    localStorage.setItem("lastSchedule", scheduleHTML);
    alert("✅ Lịch đã được lưu!");
  } else {
    alert("⚠️ Chưa có lịch để lưu!");
  }
}

// ================== Khởi tạo grid & load lịch cũ ==================
document.addEventListener("DOMContentLoaded", function () {
  initializeScheduleGrid();

  const savedSchedule = localStorage.getItem("lastSchedule");
  if (savedSchedule) {
    document.getElementById("scheduleResult").innerHTML = savedSchedule;
  }
});
