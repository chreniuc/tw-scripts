javascript: var unitsTable = document.getElementById("units_table");
troopCounterTbodies = unitsTable.querySelectorAll("tbody");
var totalsTbody = troopCounterTbodies[1].cloneNode(true);
unitsTable.insertBefore(totalsTbody, troopCounterTbodies[0]);
[].map.call(totalsTbody.querySelectorAll("td.unit-item"), function (v, i) {
  troopCounterIndex = i;
  v.style.color = "black";
  v.innerHTML = [].map
    .call(troopCounterTbodies, function (v) {
      return +v.querySelectorAll("td.unit-item")[troopCounterIndex].textContent;
    })
    .reduce(function (a, b) {
      return a + b;
    });
});
totalsTbody.style.fontWeight = "bold";
totalsTbody.querySelectorAll("td")[0].innerHTML = "Total";
[].map.call(totalsTbody.querySelectorAll("a"), function (v) {
  v.parentNode.removeChild(v);
});
troopCounterTbodies = troopCounterIndex = null;
void 0;
