const areas = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const employees = [
  { name: "Albert", areas: ["a", "b", "c", "d", "e", "f", "g", "h"] },
  { name: "Børge",  areas: ["d", "e", "f", "g", "h", "i", "j", "k"] },
  { name: "Carla",  areas: ["g", "h", "i", "j", "k", "l", "m", "n"] },
  { name: "Dorte",  areas: ["k", "l", "m", "n", "o", "p", "q", "r"] },
  { name: "Eric",   areas: ["n", "o", "p", "q", "r", "s", "t", "u"] },
  { name: "Fjolle", areas: ["a", "b", "c", "r", "s", "t", "u", "v", "w", "x", "y", "z"] },
  { name: "Gurli",  areas: ["a", "e", "i", "o", "u", "y"] },
  { name: "Hugo",   areas: ["b", "c", "e", "g", "k", "m", "q", "s", "x"] }
];

const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

app.listen(PORT);

var path = '/groups';
app.post(path, (req, res) => {
  if (!req.body) return res.status(400).send("Expected request body. None was given.");

  const { requiredAreas } = req.body;

  if (!requiredAreas) return res.status(400).send("Expected property 'requiredAreas' in request body. None was given.");

  try {
    const groups = getEssentialEmployeeCombos(requiredAreas, employees).sort((a, b) => {
      const namesA = a.map(emp => emp.name).sort().join(',');
      const namesB = b.map(emp => emp.name).sort().join(',');
      return namesA.localeCompare(namesB);
    }); 

    return res.status(200).send(groups.map(c => c.map(e => e.name[0]))); // Only returns the first letter of the employees' names
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

function getEssentialEmployeeCombos(requiredAreas, allEmployees) {
  if (!requiredAreas || requiredAreas.constructor !== Array) throw Error(`Expected array. Got ${typeof requiredAreas}.`);
  const requiredSet = new Set(requiredAreas);

  const validEmployees = allEmployees.filter(emp =>
    emp.areas.some(area => requiredSet.has(area))
  );

  const results = [];
  const totalCombos = 1 << validEmployees.length; // 2^n combinations (including [])¨

  // Loop through every possible subset of the valid employees, except the empty set
  for (let c = 1; c < totalCombos; c++) { // each bit in c representing an employee
    const combo = [];
    const areaCount = new Map(); // area -> how many employees cover it

    for (let e = 0; e < validEmployees.length; e++) { // All the valid employees
      if ((c >> e) & 1) { // Only the employees whose bit in c is 'on' - the employees in the current combo
        const emp = validEmployees[e];
        combo.push(emp);
        for (const area of emp.areas) {
          if (requiredSet.has(area)) {
            // How many employees in the current combo cover each required area
            areaCount.set(area, (areaCount.get(area) || 0) + 1);
            // We keep count to know which areas are uniquely contributed by which employees
          }
        }
      }
    }

    // Check total coverage
    const areasCovered = new Set([...areaCount.keys()]);
    const areAllAreasCovered = requiredAreas.every(area => areasCovered.has(area));
    if (!areAllAreasCovered) continue;

    // Check each employee has at least one unique contribution
    const areAllEmployeesEssential = combo.every(emp =>
      emp.areas.some(area =>
        requiredSet.has(area) && areaCount.get(area) === 1
      )
    );
    if (!areAllEmployeesEssential) continue;

    // Detect duplicate combos (e.g. B,A->A,B = A,B)
    const sortedNames = combo.map(e => e.name).sort().join(',');
    if (results.some(r => r.key === sortedNames)) continue;

    // Push unique, all-essential combos
    results.push({ key: sortedNames, combo });
  }

  return results.map(r => r.combo);
}
