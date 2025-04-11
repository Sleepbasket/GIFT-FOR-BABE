/***************************************
 *         1. 倒计时功能
 ***************************************/
let birthdayPopupShown = false;

function startCountdown(targetDate) {
  const countdownEl = document.getElementById("countdown");
  let lastValues = { d: null, h: null, m: null };
  let timer;

  function updateCountdown() {
    const now = new Date();
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) {
      clearInterval(timer);

      // 如果没弹过，就更新祝福文字并弹窗
      if (!birthdayPopupShown) {
        countdownEl.innerHTML = `
          <div class="birthday-msg">
            <h3>生日快乐，我的宝贝老婆！</h3>
          </div>
        `;
        showBirthdayPopup();
        birthdayPopupShown = true;
      }

      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

    countdownEl.innerHTML = `
      ${renderCountdownItem(days, "天", "d")}
      ${renderCountdownItem(hours, "小时", "h")}
      ${renderCountdownItem(minutes, "分钟", "m")}
    `;
    lastValues = { d: days, h: hours, m: minutes };
  }

  function renderCountdownItem(value, label, key) {
    const changed = lastValues[key] !== value;
    return `
      <div class="countdown-item ${changed ? "flip" : ""}">
        <span>${value.toString().padStart(2, "0")}</span>
        <small>${label}</small>
      </div>
    `;
  }

  updateCountdown();
  timer = setInterval(updateCountdown, 10000);
}

// 这里请注意修改生日时间，并采用 Date(year, month, day) 格式，月份从0开始
const herBirthday = new Date(2025, 3, 11);

  
  
/***************************************
*         2. 留言树洞功能（数据库版）
***************************************/
function getRandomMorandiColor() {
 const colors = ["#c3baba", "#c8c1d3", "#b2b2a3", "#d8b4a0", "#c5c6c7", "#b8a1a1", "#d4cbc9"];
 return colors[Math.floor(Math.random() * colors.length)];
}

// 发留言
function sendMessage() {
 const messageInput = document.getElementById("messageInput");
 const nicknameInput = document.getElementById("nicknameInput");
 const authorSelect = document.getElementById("authorSelect");

 const message = messageInput.value.trim();
 const nickname = nicknameInput.value.trim() || "匿名";
 const author = authorSelect.value;
 if (message === "") return;

 const data = { author, nickname, content: message };

 fetch("http://localhost:3000/api/messages", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data),
 }).then(() => {
   messageInput.value = "";
   nicknameInput.value = "";
   loadMessages();
 });
}

// 加载留言
function loadMessages() {
 fetch("http://localhost:3000/api/messages")
   .then(res => res.json())
   .then(data => {
     const messagesContainer = document.getElementById("messages");
     messagesContainer.innerHTML = "";

     data.forEach(msg => {
       const nicknameColor = getRandomMorandiColor();

       const messageBox = document.createElement("div");
       messageBox.style.marginBottom = "15px";
       messageBox.style.padding = "10px";
       messageBox.style.borderRadius = "8px";
       messageBox.style.background = msg.author === "小羊" ? "#fff3b0" : "#e6f7ff";

       const header = document.createElement("div");
       header.innerHTML = `<strong style="color:${nicknameColor}">${msg.nickname}</strong>`;
       header.style.marginBottom = "5px";

       const content = document.createElement("p");
       content.textContent = msg.content;
       content.style.margin = "5px 0";

       const replyBtn = document.createElement("button");
       replyBtn.textContent = "回复";
       replyBtn.style.marginTop = "5px";
       replyBtn.style.backgroundColor = "#aaa";
       replyBtn.style.color = "#fff";
       replyBtn.style.border = "none";
       replyBtn.style.borderRadius = "4px";
       replyBtn.style.padding = "4px 8px";
       replyBtn.style.cursor = "pointer";

       const replyContainer = document.createElement("div");
       replyContainer.style.marginTop = "8px";

       replyBtn.onclick = () => {
         if (replyContainer.childElementCount > 0) return;

         const replyInput = document.createElement("input");
         replyInput.type = "text";
         replyInput.placeholder = "写下你的回复...";
         replyInput.style.padding = "5px";
         replyInput.style.width = "65%";
         replyInput.style.marginRight = "6px";
         replyInput.style.borderRadius = "4px";
         replyInput.style.border = "1px solid #ccc";

         const sendReplyBtn = document.createElement("button");
         sendReplyBtn.textContent = "发送";
         sendReplyBtn.style.padding = "5px 10px";
         sendReplyBtn.style.backgroundColor = "#ffe37a";
         sendReplyBtn.style.color = "#333";
         sendReplyBtn.style.border = "1px solid rgb(0, 0, 0)";
         sendReplyBtn.style.borderRadius = "4px";
         sendReplyBtn.style.cursor = "pointer";
         sendReplyBtn.style.boxShadow = "3px 3px 4px rgb(0, 0, 0)";

         sendReplyBtn.onclick = function () {
           const replyText = replyInput.value.trim();
           if (replyText !== "") {
             const replyBox = document.createElement("div");
             replyBox.textContent = "小羊：" + replyText;
             replyBox.style.marginTop = "8px";
             replyBox.style.padding = "8px";
             replyBox.style.background = "#fffde7";
             replyBox.style.borderLeft = "3px solid rgb(185, 196, 249)";
             replyBox.style.borderRadius = "4px";
             replyBox.style.fontSize = "14px";
             replyBox.style.color = "#555";
             replyContainer.innerHTML = "";
             replyContainer.appendChild(replyBox);
           }
         };

         replyContainer.appendChild(replyInput);
         replyContainer.appendChild(sendReplyBtn);
       };

       messageBox.appendChild(header);
       messageBox.appendChild(content);
       messageBox.appendChild(replyBtn);
       messageBox.appendChild(replyContainer);
       messagesContainer.appendChild(messageBox);
     });
   });
}

// 页面加载时初始化留言列表
window.onload = function () {
 loadMessages();
};
  
  /***************************************
   *         3. 每日 / 每月目标
   ***************************************/
  // 加载目标（页面加载时调用）
function loadGoals() {
    fetch("http://localhost:3000/api/goals")
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById("goal-list");
        list.innerHTML = "";
        data.forEach(goal => {
          const li = document.createElement("li");
          li.classList.add("goal-item");
          li.setAttribute("data-type", goal.type);
          li.setAttribute("data-id", goal._id);
  
          li.innerHTML = `
            <label>
              <input type="checkbox" ${goal.completed ? "checked" : ""}>
              <span class="goal-tag">${goal.type === "daily" ? "每日" : "每月"}</span> ${goal.content}
            </label>
          `;
  
          li.querySelector("input").addEventListener("change", () => {
            const checked = li.querySelector("input").checked;
            fetch(`http://localhost:3000/api/goals/${goal._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ completed: checked }),
            }).then(() => checkGoals());
          });
  
          list.appendChild(li);
        });
      });
  }
  
  // 添加目标
  function addGoal() {
    const input = document.getElementById("goal-input");
    const type = document.getElementById("goal-type").value;
    const content = input.value.trim();
    if (content === "") return;
  
    fetch("http://localhost:3000/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content }),
    })
      .then(() => {
        input.value = "";
        loadGoals();
      });
  }
  
  // 检查是否全部完成 → 清除 & 弹出庆祝
  function checkGoals() {
    const list = document.getElementById("goal-list");
    const dailyItems = Array.from(list.querySelectorAll("li[data-type='daily']"));
    const monthlyItems = Array.from(list.querySelectorAll("li[data-type='monthly']"));
  
    const dailyDone = dailyItems.length > 0 && dailyItems.every(li => li.querySelector("input").checked);
    const monthlyDone = monthlyItems.length > 0 && monthlyItems.every(li => li.querySelector("input").checked);
  
    if (dailyDone) {
      fetch("http://localhost:3000/api/goals/completed/daily", { method: "DELETE" }).then(() => {
        loadGoals();
        showCelebration("每日目标完成啦！");
      });
    }
    if (monthlyDone) {
      fetch("http://localhost:3000/api/goals/completed/monthly", { method: "DELETE" }).then(() => {
        loadGoals();
        showCelebration("每月目标完成啦！");
      });
    }
  }
  
  // 显示庆祝内容
  function showCelebration(text) {
    const celebration = document.getElementById("celebration");
    celebration.textContent = `🥳 ${text}`;
    celebration.style.display = "block";
    setTimeout(() => {
      celebration.style.display = "none";
    }, 2000);
  }
  
  // 页面加载时调用
  window.onload = function () {
    loadGoals();
  };
  
 /***************************************
 *         4. 日历功能（支持月年切换 + 后端交互）
 ***************************************/
let currentClickDate = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0 = 一月

function generateCalendar(year = currentYear, month = currentMonth) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 更新顶部年月
  document.getElementById("calendar-title").textContent = `${year}年${month + 1}月`;

  // 表头
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    const header = document.createElement("div");
    header.className = "weekday";
    header.textContent = day;
    calendar.appendChild(header);
  });

  // 空白格
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // 每一天
  for (let d = 1; d <= daysInMonth; d++) {
    const dateBox = document.createElement("div");
    dateBox.className = "calendar-day";
    dateBox.setAttribute("data-daynum", d);
    dateBox.innerHTML = `<span>${d}</span>`;

    // 点击 → 打开弹窗
    dateBox.addEventListener("click", () => openModal(dateBox));

    // hover → 显示小提示
    dateBox.addEventListener("mouseenter", () => {
      const note = dateBox.getAttribute("data-note");
      const icon = dateBox.getAttribute("data-icon");
      if (note || icon) {
        const tooltip = document.createElement("div");
        tooltip.className = "note-tooltip";
        tooltip.textContent = `${icon || ""} ${note || ""}`.trim();
        document.body.appendChild(tooltip);

        const rect = dateBox.getBoundingClientRect();
        tooltip.style.top = rect.top - 30 + "px";
        tooltip.style.left = rect.left + "px";

        dateBox._tooltip = tooltip;
      }
    });

    dateBox.addEventListener("mouseleave", () => {
      if (dateBox._tooltip) {
        dateBox._tooltip.remove();
        dateBox._tooltip = null;
      }
    });

    calendar.appendChild(dateBox);
  }

  // 拉取该月计划数据
  fetch("http://localhost:3000/api/calendar")
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        if (item.year === year && item.month === month) {
          const dateBox = document.querySelector(`.calendar-day[data-daynum='${item.day}']`);
          if (dateBox) {
            dateBox.setAttribute("data-note", item.note);
            dateBox.setAttribute("data-icon", item.icon);

            const iconDiv = document.createElement("div");
            iconDiv.className = "calendar-icon-only";
            iconDiv.textContent = item.icon;
            dateBox.appendChild(iconDiv);
            dateBox.style.backgroundImage = `url("https://twemoji.maxcdn.com/v/latest/svg/${item.icon.codePointAt(0).toString(16)}.svg")`;
            dateBox.style.backgroundSize = "cover";
            dateBox.style.backgroundPosition = "center";
            dateBox.style.opacity = "0.8";
          }
        }
      });
    });

  currentYear = year;
  currentMonth = month;
}

// 月份切换按钮
function changeMonth(offset) {
  let newMonth = currentMonth + offset;
  let newYear = currentYear;

  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }

  generateCalendar(newYear, newMonth);
}

// 打开弹窗
function openModal(dateBox) {
  currentClickDate = dateBox;
  document.getElementById("calendar-note").value = dateBox.getAttribute("data-note") || "";
  document.getElementById("calendar-icon").value = dateBox.getAttribute("data-icon") || "";
  document.getElementById("modal-title").textContent = dateBox.getAttribute("data-icon") ? "修改事项" : "添加事项";
  document.getElementById("calendar-modal").style.display = "flex";
}

// 关闭弹窗
function closeModal() {
  document.getElementById("calendar-modal").style.display = "none";
}

// 保存计划（本地 + 后端）
function saveNote() {
  const note = document.getElementById("calendar-note").value.trim();
  const icon = document.getElementById("calendar-icon").value;
  if (!note && !icon) {
    closeModal();
    return;
  }

  const dayNum = currentClickDate.getAttribute("data-daynum");
  currentClickDate.innerHTML = `<span>${dayNum}</span>`;
  currentClickDate.setAttribute("data-note", note);
  currentClickDate.setAttribute("data-icon", icon);

  if (icon) {
    const iconDiv = document.createElement("div");
    iconDiv.className = "calendar-icon-only";
    iconDiv.textContent = icon;
    currentClickDate.appendChild(iconDiv);
    currentClickDate.style.backgroundImage = `url("https://twemoji.maxcdn.com/v/latest/svg/${icon.codePointAt(0).toString(16)}.svg")`;
    currentClickDate.style.backgroundSize = "cover";
    currentClickDate.style.backgroundPosition = "center";
    currentClickDate.style.opacity = "0.8";
  } else {
    currentClickDate.style.backgroundImage = "";
    currentClickDate.style.opacity = "1";
  }

  // 发请求存入数据库
  fetch("http://localhost:3000/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      year: currentYear,
      month: currentMonth,
      day: parseInt(dayNum),
      icon,
      note,
    }),
  });

  closeModal();
}

// 删除计划
function deleteNote() {
    const dayNum = parseInt(currentClickDate.getAttribute("data-daynum"));
    const year = parseInt(currentYear);
    const month = parseInt(currentMonth);
  
    // 前端移除显示
    currentClickDate.innerHTML = `<span>${dayNum}</span>`;
    currentClickDate.removeAttribute("data-note");
    currentClickDate.removeAttribute("data-icon");
    currentClickDate.style.backgroundImage = "";
    currentClickDate.style.opacity = "1";
  
    // 同步删除后端数据
    fetch("http://localhost:3000/api/calendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(currentYear),
          month: parseInt(currentMonth),
          day: parseInt(dayNum)
        }),
      });
  
    closeModal();
  }
// 页面加载
window.addEventListener("load", () => {
  generateCalendar();
});


  //每日歌曲推荐
  const songIframes = [
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=2604340091&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1878104639&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=2055266718&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1979981796&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=2064960966&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1421780908&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1921417012&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1363675487&auto=1&height=66"></iframe>',
    '<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=1936154986&auto=1&height=66"></iframe>'
  ];
  
  // 每次刷新随机选一个
  function showRandomSongIframe() {
    const randomIndex = Math.floor(Math.random() * songIframes.length);
    const pickedIframe = songIframes[randomIndex];
  
    // 把这个 iframe 插到 #song-box
    const songBox = document.getElementById("song-box");
    // 先清空
    songBox.innerHTML = '<h2>今日歌曲推荐</h2>';
    // 再加入随机 iframe
    songBox.innerHTML += pickedIframe;
  }
  

  function showBirthdayPopup() {
    // 检查是否已经有弹窗在页面中
    if (document.querySelector(".birthday-popup-overlay")) {
      return; // 已经存在则直接返回，不再创建新的弹窗
    }
  
    // 创建覆盖层
    const overlay = document.createElement("div");
    overlay.className = "birthday-popup-overlay";
  
    // 创建弹窗内容区
    const popup = document.createElement("div");
    popup.className = "birthday-popup";
  
    // 静态标题：显示英文"Happy Birthday!"（黄蓝配色可以在 CSS 调整）
    const staticHeading = document.createElement("h1");
    staticHeading.className = "static-title";
    staticHeading.textContent = "Happy Birthday!";
    popup.appendChild(staticHeading);
  
    // 创建打字效果区域，用于逐步显示中文信件
    const typingContainer = document.createElement("div");
    typingContainer.className = "typing-container";
    const typingText = document.createElement("p");
    typingText.className = "typing-effect";
    typingText.innerHTML = "";  // 初始为空
    typingContainer.appendChild(typingText);
    popup.appendChild(typingContainer);
  
    // 定义要打字显示的中文内容，\n 代表换行
    const letter = "心宝～生日快乐！\n恭喜老婆大人步入美好的21岁！";
    let index = 0;
    const speed = 100; // 每个字符间隔 100 毫秒
  
    function typeLetter() {
      if (index < letter.length) {
        if (letter[index] === "\n") {
          typingText.innerHTML += "<br>";
        } else {
          typingText.innerHTML += letter[index];
        }
        index++;
        setTimeout(typeLetter, speed);
      }
    }
    typeLetter();
  
    // 加入蛋糕图片作为装饰
    const cake = document.createElement("img");
    cake.src = "截屏 2025-04-11 13.34.19.jpeg"; // 替换为你的蛋糕图片链接
    cake.alt = "蛋糕";
    cake.className = "cake-img";
    popup.appendChild(cake);
  
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  
    // 点击覆盖层关闭弹窗
    overlay.addEventListener("click", () => {
      overlay.remove();
    });
  
    // 淡入动画
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 10);
  }

  // 网页加载完后执行
  window.addEventListener("DOMContentLoaded", () => {
    startCountdown(herBirthday);
    generateCalendar();
    showRandomSongIframe();
  });

  