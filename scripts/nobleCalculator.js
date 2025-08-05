(function () {
  if (typeof DEBUG !== "boolean") DEBUG = false;

  const nobleCost = {
    wood: 40000,
    stone: 50000,
    iron: 50000,
  };

  const coinCost = {
    wood: 28000,
    stone: 30000,
    iron: 25000,
  };

  function formatNumber(num) {
    return num.toLocaleString("de-DE");
  }

  function getIntFromInnerText(selector) {
    const el = document.querySelector(selector);
    if (!el) return 0;
    return parseInt(el.textContent.replace(/[^\d]/g, ""), 10);
  }

  function getPartialCoins() {
    const row = [...document.querySelectorAll("table.vis tr")].find((row) =>
      row.textContent.includes("Până la limita")
    );
    if (!row) return 0;
    const needed = row.querySelectorAll("td")[1].textContent;
    return parseInt(needed.replace(/[^\d]/g, ""), 10);
  }

  function getSavedCoins() {
    const row = [...document.querySelectorAll("table.vis tr")].find((row) =>
      row.textContent.includes("economisit deja")
    );
    if (!row) return 0;
    const saved = row.querySelectorAll("td")[1].textContent;
    return parseInt(saved.replace(/[^\d]/g, ""), 10);
  }

  function getCurrentNobleLimit() {
    const row = [...document.querySelectorAll("table.vis tr")].find((row) =>
      row.textContent.includes("Limita actuală")
    );
    if (!row) return 0;
    const limit = row.querySelectorAll("td")[1].textContent;
    return parseInt(limit.replace(/[^\d]/g, ""), 10);
  }

  function calculateCoinsNeeded(noblesWanted, currentLimit, savedCoins) {
    let totalCoins = 0;
    let startingNoble = currentLimit + 1;

    if (savedCoins > 0) {
      totalCoins += savedCoins;
    }

    for (let i = 0; i < noblesWanted; i++) {
      totalCoins += startingNoble + i;
    }

    return totalCoins;
  }

  function calculateResources(coinsNeeded, noblesAmount) {
    return {
      woodCoins: coinsNeeded * coinCost.wood,
      stoneCoins: coinsNeeded * coinCost.stone,
      ironCoins: coinsNeeded * coinCost.iron,
      woodNobles: noblesAmount * nobleCost.wood,
      stoneNobles: noblesAmount * nobleCost.stone,
      ironNobles: noblesAmount * nobleCost.iron,
    };
  }

  function renderUI(defaultNobles = 4) {
    const html = `
            <div class="ra-grid">	
                <div>
                    <div class="ra-mb15">
                        <label for="raNoblesAmount">
                            Câte generații de nobili vrei să calculezi?
                        </label>
                        <input class="ra-input" id="raNoblesAmount" type="number" value="${defaultNobles}">
                    </div>
                    <a class="btn" href="javascript:void(0)" id="raCalculateResourcesBtn">
                        Calculează resursele
                    </a>
                </div>	
                <div>
                    <table class="ra-table ra-table-v2" width="100%">
                        <thead>
                            <tr>
                                <th></th>
                                <th><span class="icon header wood"></span> Lemn</th>
                                <th><span class="icon header stone"></span> Argilă</th>
                                <th><span class="icon header iron"></span> Fier</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Taleri <span id="raCoinsAmount"></span></b></td>
                                <td id="raWoodNeededCoins"></td>
                                <td id="raStoneNeededCoins"></td>
                                <td id="raIronNeededCoins"></td>
                            </tr>
                            <tr>
                                <td><b>Nobili</b></td>
                                <td id="raWoodNeededNobles"></td>
                                <td id="raStoneNeededNobles"></td>
                                <td id="raIronNeededNobles"></td>
                            </tr>
                            <tr>
                                <td><b>TOTAL</b></td>
                                <td id="raTotalWood"></td>
                                <td id="raTotalStone"></td>
                                <td id="raTotalIron"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.innerHTML = `
            .ra-grid { display: grid; grid-template-columns: 1fr 3fr; gap: 15px; margin-top: 15px; }
            .ra-input { padding: 3px; font-size: 14px; }
            .ra-table-v2 { border-spacing: 2px !important; border-collapse: separate !important; }
        `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.innerHTML = html;

    document.querySelector("#content_value")?.prepend(container);

    document
      .querySelector("#raCalculateResourcesBtn")
      .addEventListener("click", () => {
        const noblesAmount = parseInt(
          document.querySelector("#raNoblesAmount").value,
          10
        );
        const currentLimit = getCurrentNobleLimit();
        const savedCoins = getSavedCoins();
        const coinsNeeded =
          calculateCoinsNeeded(noblesAmount, currentLimit, 0) - savedCoins;

        document.querySelector("#raCoinsAmount").textContent =
          formatNumber(coinsNeeded);

        const resources = calculateResources(coinsNeeded, noblesAmount);

        document.querySelector("#raWoodNeededCoins").textContent = formatNumber(
          resources.woodCoins
        );
        document.querySelector("#raStoneNeededCoins").textContent =
          formatNumber(resources.stoneCoins);
        document.querySelector("#raIronNeededCoins").textContent = formatNumber(
          resources.ironCoins
        );

        document.querySelector("#raWoodNeededNobles").textContent =
          formatNumber(resources.woodNobles);
        document.querySelector("#raStoneNeededNobles").textContent =
          formatNumber(resources.stoneNobles);
        document.querySelector("#raIronNeededNobles").textContent =
          formatNumber(resources.ironNobles);

        document.querySelector("#raTotalWood").textContent = formatNumber(
          resources.woodCoins + resources.woodNobles
        );
        document.querySelector("#raTotalStone").textContent = formatNumber(
          resources.stoneCoins + resources.stoneNobles
        );
        document.querySelector("#raTotalIron").textContent = formatNumber(
          resources.ironCoins + resources.ironNobles
        );
      });

    // auto-click to show results
    document.querySelector("#raCalculateResourcesBtn")?.click();
  }

  renderUI(4); // Default 4 noblemen
})();
