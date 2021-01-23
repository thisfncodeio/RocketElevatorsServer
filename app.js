const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
let values;
const totals = {
  recommended: 0,
  costBasedOnQuantity: 0,
  installationCost: 0,
  finalTotal: 0
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/", (request, response) => {
  values = request.body.values;
  getRecommended(request.body.selectedBuildingType);
  getTotals();
  response.send(totals);
})

function getRecommended(selectedBuildingType) {
  // COMMERCIAL
  if (selectedBuildingType === "commercial") {
    console.log("commercial")
    values.recommended = values.elevators;
    totals.recommended = values.recommended;
    return;
  }

  // RESIDENTIAL
  if (selectedBuildingType === "residential") {
    if (values.apartments <= 0 || values.floors <= 0) return;

    let doorsPerFloor = Math.ceil(values.apartments / values.floors);
    let elevatorShaftsNeeded = Math.ceil(doorsPerFloor / 6); //<== require an elevator shaft for every 6 apartments
    let columnsRequired = Math.ceil(values.floors / 20); //<== every 20 floors requires an additional column
    values.recommended = columnsRequired * elevatorShaftsNeeded;
    totals.recommended = values.recommended;
    return;
  }

  // CORPORATE/HYBRID
  if (selectedBuildingType === "corporate" || selectedBuildingType === "hybrid") {
    if (values.floors <= 0 || values.basements <= 0 || values.occupants <= 0) return;

    let totalOccupants = values.occupants * (values.floors + values.basements);
    let elevatorShaftsNeeded = Math.ceil(totalOccupants / 1000);
    let columnsRequired = Math.ceil((values.floors + values.basements) / 20); //<== every 20 floors requires an additional column
    let elevatorsPerColumn = Math.ceil(elevatorShaftsNeeded / columnsRequired);
    values.recommended = columnsRequired * elevatorsPerColumn;
    totals.recommended = values.recommended;
    return;
  }
}

function getTotals() {
  let costBasedOnQuantity = values.recommended * values.unitCost;
  console.log(costBasedOnQuantity);
  totals.costBasedOnQuantity = formatPrice(costBasedOnQuantity);
  totals.installationCost = formatPrice(costBasedOnQuantity * values.installationCost);
  totals.finalTotal = formatPrice(costBasedOnQuantity + (costBasedOnQuantity * values.installationCost));
}

function formatPrice(amount) {
  return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}




app.listen(PORT, () => console.log(`Server running on port: ${PORT}...`));
