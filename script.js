let members = ["Hảo", "Vy", "Hiếu", "Thùy", "Hương"];
const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const dayKeys = ["t2", "t3", "t4", "t5", "t6", "t7", "cn"];

// Khởi tạo giao diện
function initializeScheduleGrid() {
  const grid = document.getElementById("scheduleGrid");

  members.forEach((member, memberIndex) => {
    // Tên thành viên là input để chỉnh sửa
    const memberInput = document.createElement("input");
    memberInput.type = "text";
    memberInput.className = "member-name";
    memberInput.value = member;
    memberInput.addEventListener('change', (e) => {
      const newName = e.target.value.trim();
      if (newName && newName !== members[memberIndex]) {
        const oldName = members[memberIndex];
        // Cập nhật tất cả data-member từ cũ sang mới
        document.querySelectorAll(`[data-member="${oldName}"]`).forEach(btn => {
          btn.setAttribute('data-member', newName);
        });
        members[memberIndex] = newName;
        // Lưu members mới
        localStorage.setItem('members', JSON.stringify(members));
        // Lưu lại state với tên mới
        saveState();
      } else if (!newName) {
        e.target.value = members[memberIndex]; // Khôi phục nếu rỗng
      }
    });
    grid.appendChild(memberInput);

    // Các ngày trong tuần
    dayKeys.forEach((dayKey) => {
      const dayCell = document.createElement("div");
      dayCell.className = "day-cell";

      const shiftButtons = document.createElement("div");
      shiftButtons.className = "shift-buttons";

      // Nút ca sáng
      const morningBtn = document.createElement("button");
      morningBtn.className = "shift-btn morning";
      morningBtn.textContent = "Sáng";
      morningBtn.setAttribute("data-member", member);
      morningBtn.setAttribute("data-day", dayKey);
      morningBtn.setAttribute("data-shift", "morning");
      morningBtn.onclick = toggleShift;

      // Nút ca chiều
      const eveningBtn = document.createElement("button");
      eveningBtn.className = "shift-btn evening";
      eveningBtn.textContent = "Chiều";
      eveningBtn.setAttribute("data-member", member);
      eveningBtn.setAttribute("data-day", dayKey);
      eveningBtn.setAttribute("data-shift", "evening");
      eveningBtn.onclick = toggleShift;

      // Nút off
      const offBtn = document.createElement("button");
      offBtn.className = "shift-btn off";
      offBtn.textContent = "Off";
      offBtn.setAttribute("data-member", member);
      offBtn.setAttribute("data-day", dayKey);
      offBtn.setAttribute("data-shift", "off");
      offBtn.onclick = toggleShift;

      shiftButtons.appendChild(morningBtn);
      shiftButtons.appendChild(eveningBtn);
      shiftButtons.appendChild(offBtn);
      dayCell.appendChild(shiftButtons);
      grid.appendChild(dayCell);
    });
  });
}

function toggleShift(e) {
  const btn = e.target;
  const member = btn.getAttribute('data-member');
  const day = btn.getAttribute('data-day');
  const shift = btn.getAttribute('data-shift');

  const buttons = document.querySelectorAll(
    `[data-member="${member}"][data-day="${day}"]`
  );

  if (shift === "off") {
    // Nếu chọn off, bỏ chọn tất cả các ca khác
    buttons.forEach((b) => {
      b.classList.remove("selected");
    });
    // Chọn off
    btn.classList.add("selected");
  } else {
    // Bỏ chọn off nếu chọn ca làm việc
    document
      .querySelector(
        `[data-member="${member}"][data-day="${day}"][data-shift="off"]`
      )
      .classList.remove("selected");

    // Toggle ca được chọn
    btn.classList.toggle("selected");
  }
}

function resetAll() {
  const allButtons = document.querySelectorAll(".shift-btn");
  allButtons.forEach((btn) => btn.classList.remove("selected"));
  document.getElementById("scheduleResult").innerHTML = "";
  localStorage.removeItem('scheduleState');
  // Optional: Reset members to default if needed
  // localStorage.removeItem('members');
}

function generateSchedule() {
  const scheduleData = {};

  // Thu thập dữ liệu từ các nút đã chọn
  members.forEach((member) => {
    scheduleData[member] = {
      morning: [],
      evening: [],
    };

    dayKeys.forEach((dayKey, index) => {
      const morningBtn = document.querySelector(
        `[data-member="${member}"][data-day="${dayKey}"][data-shift="morning"]`
      );
      const eveningBtn = document.querySelector(
        `[data-member="${member}"][data-day="${dayKey}"][data-shift="evening"]`
      );

      if (morningBtn && morningBtn.classList.contains("selected")) {
        scheduleData[member].morning.push(days[index]);
      }

      if (eveningBtn && eveningBtn.classList.contains("selected")) {
        scheduleData[member].evening.push(days[index]);
      }
    });
  });

  // Tạo lịch làm việc
  const weeklySchedule = {};

  days.forEach((day) => {
    const morningMembers = [];
    const eveningMembers = [];
    const offMembers = [];

    members.forEach((member) => {
      const hasMorning = scheduleData[member].morning.includes(day);
      const hasEvening = scheduleData[member].evening.includes(day);

      if (hasMorning) {
        morningMembers.push({ name: member });
      }
      if (hasEvening) {
        eveningMembers.push({ name: member });
      }
      if (!hasMorning && !hasEvening) {
        offMembers.push({ name: member });
      }
    });

    weeklySchedule[day] = {
      morningMembers: morningMembers,
      eveningMembers: eveningMembers,
      offMembers: offMembers,
    };
  });

  displaySchedule(weeklySchedule);
  saveState(); // Lưu trạng thái sau khi tạo lịch
}

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

  let html = `
        <div style="margin-top: 30px;">
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">
                📅 Lịch làm SVH (${weekDates[0]
                  .getDate()
                  .toString()
                  .padStart(2, "0")}/${(weekDates[0].getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${weekDates[6].getDate().toString().padStart(2, "0")}/${(
    weekDates[6].getMonth() + 1
  )
    .toString()
    .padStart(2, "0")})
            </h2>
            
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th class="row-header">THỨ/ NGÀY</th>
                        ${days
                          .map(
                            (day, index) => `
                            <th class="day-name-header">${day}</th>
                        `
                          )
                          .join("")}
                    </tr>
                    <tr>
                        <th class="row-header"></th>
                        ${weekDates
                          .map(
                            (date) => `
                            <th class="date-header">${date
                              .getDate()
                              .toString()
                              .padStart(2, "0")}/${(date.getMonth() + 1)
                              .toString()
                              .padStart(2, "0")}/${date.getFullYear()}</th>
                        `
                          )
                          .join("")}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="row-header">SÁNG (8:30 - 15:30)</td>
                        ${days
                          .map((day) => {
                            const daySchedule = schedule[day];
                            const morningNames = daySchedule.morningMembers.map(
                              (m) => m.name
                            );

                            return `<td class="member-cell">
                                ${
                                  morningNames.length > 0
                                    ? morningNames
                                        .map(
                                          (name) =>
                                            `<div style="margin: 2px 0; padding: 2px; background: #ffeaa7; border-radius: 3px;">${name}</div>`
                                        )
                                        .join("")
                                    : '<div style="color: #999;">-</div>'
                                }
                            </td>`;
                          })
                          .join("")}
                    </tr>
                    <tr>
                        <td class="row-header">CHIỀU (15:00 - 22:00)</td>
                        ${days
                          .map((day) => {
                            const daySchedule = schedule[day];
                            const eveningNames = daySchedule.eveningMembers.map(
                              (m) => m.name
                            );

                            return `<td class="member-cell">
                                ${
                                  eveningNames.length > 0
                                    ? eveningNames
                                        .map(
                                          (name) =>
                                            `<div style="margin: 2px 0; padding: 2px; background: #74b9ff; color: white; border-radius: 3px;">${name}</div>`
                                        )
                                        .join("")
                                    : '<div style="color: #999;">-</div>'
                                }
                            </td>`;
                          })
                          .join("")}
                    </tr>
                    <tr>
                        <td class="off-row">OFF</td>
                        ${days
                          .map((day) => {
                            const daySchedule = schedule[day];
                            const offNames = daySchedule.offMembers.map(
                              (m) => m.name
                            );

                            return `<td class="off-row">
                                ${
                                  offNames.length > 0
                                    ? offNames
                                        .map(
                                          (name) =>
                                            `<div style="margin: 2px 0;">${name}</div>`
                                        )
                                        .join("")
                                    : "<div>-</div>"
                                }
                            </td>`;
                          })
                          .join("")}
                    </tr>
                </tbody>
            </table>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #2d5a2d; margin-bottom: 15px;">📊 Thống kê ca làm việc:</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${members
                      .map((member) => {
                        let morningCount = 0;
                        let eveningCount = 0;
                        let offCount = 0;

                        days.forEach((day) => {
                          const daySchedule = schedule[day];
                          if (
                            daySchedule.morningMembers.find(
                              (m) => m.name === member
                            )
                          )
                            morningCount++;
                          if (
                            daySchedule.eveningMembers.find(
                              (m) => m.name === member
                            )
                          )
                            eveningCount++;
                          if (
                            daySchedule.offMembers.find(
                              (m) => m.name === member
                            )
                          )
                            offCount++;
                        });

                        return `
                            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <strong style="color: #2d5a2d; font-size: 1.1rem;">${member}</strong><br>
                                <div style="margin-top: 8px; font-size: 0.9rem;">
                                    <span style="color: #e67e22;">🌅 Sáng: ${morningCount}</span><br>
                                    <span style="color: #3498db;">🌆 Chiều: ${eveningCount}</span><br>
                                    <span style="color: #e74c3c;">😴 Off: ${offCount}</span>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        </div>
    `;

  document.getElementById("scheduleResult").innerHTML = html;
}

function saveState() {
  const state = {};
  members.forEach((member) => {
    state[member] = {};
    dayKeys.forEach((dayKey) => {
      state[member][dayKey] = {
        morning: document.querySelector(
          `[data-member="${member}"][data-day="${dayKey}"][data-shift="morning"]`
        )?.classList.contains("selected") || false,
        evening: document.querySelector(
          `[data-member="${member}"][data-day="${dayKey}"][data-shift="evening"]`
        )?.classList.contains("selected") || false,
        off: document.querySelector(
          `[data-member="${member}"][data-day="${dayKey}"][data-shift="off"]`
        )?.classList.contains("selected") || false,
      };
    });
  });
  localStorage.setItem("scheduleState", JSON.stringify(state));
}

function loadMembers() {
  const savedMembers = localStorage.getItem('members');
  if (savedMembers) {
    try {
      members = JSON.parse(savedMembers);
    } catch (e) {
      console.error('Dữ liệu members không hợp lệ:', e);
      localStorage.removeItem('members');
      // Giữ default members
    }
  }
}

function loadScheduleState() {
  const saved = localStorage.getItem("scheduleState");
  if (saved) {
    try {
      const state = JSON.parse(saved);
      members.forEach((member) => {
        dayKeys.forEach((dayKey) => {
          const shifts = state[member]?.[dayKey];
          if (shifts) {
            if (shifts.morning) {
              document
                .querySelector(
                  `[data-member="${member}"][data-day="${dayKey}"][data-shift="morning"]`
                )
                ?.classList.add("selected");
            }
            if (shifts.evening) {
              document
                .querySelector(
                  `[data-member="${member}"][data-day="${dayKey}"][data-shift="evening"]`
                )
                ?.classList.add("selected");
            }
            if (shifts.off) {
              document
                .querySelector(
                  `[data-member="${member}"][data-day="${dayKey}"][data-shift="off"]`
                )
                ?.classList.add("selected");
            }
          }
        });
      });
      // Tự động hiển thị lịch gần nhất
      generateSchedule();
    } catch (e) {
      console.error('Dữ liệu scheduleState không hợp lệ:', e);
      localStorage.removeItem('scheduleState');
    }
  }
}

// Khởi tạo giao diện khi trang load
document.addEventListener("DOMContentLoaded", function () {
  loadMembers(); // Load members trước
  initializeScheduleGrid(); // Khởi tạo grid với members đã load
  loadScheduleState(); // Sau đó áp dụng state
});
