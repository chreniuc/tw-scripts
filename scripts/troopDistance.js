(function () {
  const STORAGE_KEY = "tw_arrival_time_target";

  function parseDateString(str) {
    const match = str.match(
      /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
    );
    if (!match) return null;
    const [_, d, m, y, h, min, s] = match.map(Number);
    return new Date(y, m - 1, d, h, min, s);
  }

  function calculateSendTime(arrival, durationStr) {
    const [h, m, s] = durationStr.split(":").map(Number);
    const travelMs = (h * 3600 + m * 60 + s) * 1000;
    return new Date(arrival.getTime() - travelMs);
  }

  function formatDateTime(date) {
    const pad = (v) => String(v).padStart(2, "0");
    return (
      `${pad(date.getDate())}.${pad(
        date.getMonth() + 1
      )}.${date.getFullYear()} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`
    );
  }

  function injectArrivalInput() {
    const ref = document.getElementById("continent_id");
    if (!ref || document.getElementById("arrival_time_input")) return;

    const input = document.createElement("input");
    input.type = "text";
    input.id = "arrival_time_input";
    input.placeholder = "DD.MM.YYYY HH:MM:SS";
    input.style.marginLeft = "10px";
    input.style.width = "180px";

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) input.value = saved;

    input.addEventListener("change", () => {
      localStorage.setItem(STORAGE_KEY, input.value.trim());
    });

    ref.parentNode.appendChild(input);
  }
  function injectSendTimes() {
    const arrivalStr = localStorage.getItem(STORAGE_KEY);
    const arrival = parseDateString(arrivalStr);
    if (!arrival) return;

    const popup = document.getElementById("map_popup");
    if (!popup) return;

    const allRows = [...popup.querySelectorAll("tr.center")];
    if (popup.querySelector("#send_time_row")) return;

    const iconRow = allRows.find((row) =>
      [...row.querySelectorAll("td")].every((td) => td.querySelector("img"))
    );
    if (!iconRow) return;

    const unitCount = iconRow.querySelectorAll("td").length;
    const now = new Date();

    let countRow = iconRow.nextElementSibling;
    let timeRow = countRow?.nextElementSibling;

    // If countRow is actually the time row, we’re missing the count row
    const isTimeRow = [...countRow.querySelectorAll("td")].every((td) =>
      /^\d{1,2}:\d{2}:\d{2}$/.test(td.textContent.trim())
    );
    if (isTimeRow) {
      timeRow = countRow;
      countRow = document.createElement("tr");
      countRow.className = "center";
      countRow.id = "fake_count_row";

      const label = document.createElement("td");
      label.textContent = "Count";
      label.style.fontWeight = "bold";
      label.style.textAlign = "right";
      countRow.appendChild(label);

      for (let i = 0; i < unitCount; i++) {
        const td = document.createElement("td");
        td.textContent = "";
        countRow.appendChild(td);
      }

      iconRow.parentNode.insertBefore(countRow, timeRow);
    }

    function addLabel(row, text) {
      if (row.children.length === unitCount) {
        const label = document.createElement("td");
        label.textContent = text;
        label.style.fontWeight = "bold";
        label.style.textAlign = "right";
        row.insertBefore(label, row.firstChild);
      }
    }

    addLabel(iconRow, "Units");
    addLabel(countRow, "Count");
    addLabel(timeRow, "Travel time");

    const sendRow = document.createElement("tr");
    sendRow.id = "send_time_row";
    sendRow.className = "center";
    const sendLabel = document.createElement("td");
    sendLabel.textContent = "Send at";
    sendLabel.style.fontWeight = "bold";
    sendLabel.style.textAlign = "right";
    sendRow.appendChild(sendLabel);

    const nowRow = document.createElement("tr");
    nowRow.id = "arrival_if_now_row";
    nowRow.className = "center";
    const nowLabel = document.createElement("td");
    nowLabel.textContent = "Arrival if sent now";
    nowLabel.style.fontWeight = "bold";
    nowLabel.style.textAlign = "right";
    nowRow.appendChild(nowLabel);

    const timeCells = [...timeRow.querySelectorAll("td")].slice(1);

    for (const td of timeCells) {
      const text = td.textContent.trim();

      const sendCell = document.createElement("td");
      const arrivalCell = document.createElement("td");

      sendCell.style.padding = td.style.padding;
      sendCell.style.backgroundColor = td.style.backgroundColor;
      arrivalCell.style.padding = td.style.padding;
      arrivalCell.style.backgroundColor = td.style.backgroundColor;

      if (/^\d{1,2}:\d{2}:\d{2}$/.test(text)) {
        const sendDate = calculateSendTime(arrival, text);
        sendCell.textContent = formatDateTime(sendDate);

        const [h, m, s] = text.split(":").map(Number);
        const arrivalIfNow = new Date(
          now.getTime() + (h * 3600 + m * 60 + s) * 1000
        );
        arrivalCell.textContent = formatDateTime(arrivalIfNow);
      } else {
        sendCell.textContent = "";
        arrivalCell.textContent = "";
      }

      sendRow.appendChild(sendCell);
      nowRow.appendChild(arrivalCell);
    }

    timeRow.parentNode.insertBefore(sendRow, timeRow.nextElementSibling);
    sendRow.parentNode.insertBefore(nowRow, sendRow.nextElementSibling);
  }

  function observePopup() {
    const popup = document.getElementById("map_popup");
    if (!popup) return;

    const observer = new MutationObserver(() => {
      injectSendTimes();
    });

    observer.observe(popup, { childList: true, subtree: true });
  }

  function init() {
    injectArrivalInput();
    observePopup();
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
