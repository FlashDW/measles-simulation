let population = [];
let toExpose = [];

// percent less likely to catch mealses when vaccinated (actual is about 95%)
let vaccinationEffectiveness = 0.95;

let dayLength = 60; //frames
let exposureTimeDays = 11;
let recoveryTimeDays = 9;

let exposureTime = dayLength * exposureTimeDays;
let recoveryTime = dayLength * recoveryTimeDays;

let dayCount = 0;

// play around with these
let startingPopulationSize = 150;
let vaxPercent = 0.9;
let infectedAtStart = 1;
let interactionDistance = 30;
let spreadChancePerFrame = 0.05;
let deathChanceIfHospitalized = 0.033;
let hospitalizationRateNoVax = 0.2;
let hospitalizationRateWithVax = 0.06;

// stats
let susceptible;
let exposed;
let infectious;
let recovered;
let dead;

let running = false;

// buttons
let pauseButton;
let resetButton;
let infoButton;

// sliders
let popSizeSlider;
let vaxPercentSlider;
let infectedAtStartSlider;

let frameNum = 0;

//histories
let susceptibleHistory = [];
let exposedHistory = [];
let infectiousHistory = [];
let recoveredHistory = [];
let deadHistory = [];

let simHeight = 700;
let graphHeight = 250;

let sColor;
let eColor;
let iColor;
let rColor;
let dColor;

function setup() {
  createCanvas(730, simHeight + graphHeight);

  sColor = color("DodgerBlue");
  eColor = color(200, 200, 0);
  iColor = color(200, 0, 0);
  rColor = color("purple");
  dColor = color(0, 0, 0);

  // create buttons
  pauseButton = createDiv("▶️");
  pauseButton.position(10, 10);
  pauseButton.mousePressed(startOrStopSim);
  pauseButton.style("cursor", "pointer");
  pauseButton.style("font-size", "32px");
  pauseButton.style("user-select", "none");

  resetButton = createDiv("🔄");
  resetButton.position(50, 10);
  resetButton.mousePressed(reset);
  resetButton.style("cursor", "pointer");
  resetButton.style("font-size", "32px");
  resetButton.style("user-select", "none");

  infoButton = createDiv("ℹ️");
  infoButton.position(width - 54, 10);
  infoButton.mousePressed(toggleInfo);
  infoButton.style("cursor", "pointer");
  infoButton.style("font-size", "32px");
  infoButton.style("user-select", "none");

  // setup overlay close button
  let overlay = document.getElementById("info-overlay");
  let closeButton = document.getElementById("close-info");

  closeButton.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });


  //create sliders
  popSizeSlider = createSlider(10, 500, 150, 10);
  popSizeSlider.position(230, simHeight - 40);
  popSizeSlider.changed(updateSim);

  vaxPercentSlider = createSlider(0, 100, 90, 1);
  vaxPercentSlider.position(400, simHeight - 40);
  vaxPercentSlider.changed(updateSim);

  infectedAtStartSlider = createSlider(1, 10, 1, 1);
  infectedAtStartSlider.position(570, simHeight - 40);
  infectedAtStartSlider.changed(updateSim);

  initializePopulation();
  calculateStats();

  recordHistory();
}

function draw() {
  background(70);

  let dayEnded = false;

  if (running) {
    frameNum += 1;
    if (frameNum >= dayLength) {
      frameNum = 0;
      dayCount += 1;
      dayEnded = true;
    }
    stepSim();
  } else {
    stepSim(false);
  }
  calculateStats();

  if (dayEnded) {
    recordHistory();
  }

  showStats();
  showGraph();
}

function initializePopulation() {
  population = [];

  // make a list of random indexes for people that wont have a vax
  let noVaxIndexes = [...Array(startingPopulationSize).keys()];
  noVaxIndexes = shuffle(noVaxIndexes);
  let noVaxAmount = round(
    startingPopulationSize - startingPopulationSize * vaxPercent
  );
  noVaxIndexes = noVaxIndexes.slice(0, noVaxAmount);

  // make a list of random indexes for people that will start infected
  let infectedIndexes = [...Array(startingPopulationSize).keys()];
  infectedIndexes = shuffle(infectedIndexes);
  infectedIndexes = infectedIndexes.slice(0, infectedAtStart);

  // fill the population list with people
  for (let i = 0; i < startingPopulationSize; i++) {
    let p = new Person();

    if (noVaxIndexes.includes(i)) {
      p.vax = false;
    }
    if (infectedIndexes.includes(i)) {
      p.status = "infectious";
      p.recoveryTime = recoveryTime + random(-dayLength, dayLength);
    }

    population.push(p);
  }
}

function reset() {
  //set slider values
  startingPopulationSize = popSizeSlider.value();
  vaxPercent = vaxPercentSlider.value() * 0.01;
  infectedAtStart = infectedAtStartSlider.value();

  population = [];
  initializePopulation();

  toExpose = [];

  dayCount = 0;
  frameNum = 0;

  susceptibleHistory = [];
  exposedHistory = [];
  infectiousHistory = [];
  recoveredHistory = [];
  deadHistory = [];

  running = false;
  pauseButton.html("▶️");

  calculateStats();
  recordHistory();
}

function updateSim() {
  if (!running) {
    reset();
  }
}

function calculateStats() {
  susceptible = 0;
  exposed = 0;
  infectious = 0;
  recovered = 0;
  dead = 0;
  for (let p of population) {
    if (p.status == "dead") {
      dead += 1;
    } else if (p.status == "exposed") {
      exposed += 1;
    } else if (p.status == "infectious") {
      infectious += 1;
    } else if (p.status == "recovered") {
      recovered += 1;
    } else if (p.status == "susceptible") {
      susceptible += 1;
    }
  }

  if (
    susceptible + exposed + infectious + recovered + dead !=
    startingPopulationSize
  ) {
    print("error 1");
  }
}

function recordHistory() {
  susceptibleHistory.push((susceptible / startingPopulationSize) * 100);
  exposedHistory.push((exposed / startingPopulationSize) * 100);
  infectiousHistory.push((infectious / startingPopulationSize) * 100);
  recoveredHistory.push((recovered / startingPopulationSize) * 100);
  deadHistory.push((dead / startingPopulationSize) * 100);
}

function showStats() {
  let statX = 10;
  let statY = simHeight - 200;
  let statW = 200;
  let statH = 190;

  // draw HUD
  fill(240, 220);
  noStroke();
  rect(statX, statY, statW, statH, 15);
  textAlign(LEFT, TOP);
  textSize(20);

  let statPadding = statX + 10;
  let statYStart = statY + 10;
  let statYSpacing = 25;

  fill("DodgerBlue");
  text("Susceptible: " + susceptible, statPadding, statYStart);
  fill(200, 200, 0);
  text("Exposed: " + exposed, statPadding, statYStart + statYSpacing);
  fill(200, 0, 0);
  text("Infectious: " + infectious, statPadding, statYStart + statYSpacing * 2);
  fill("purple");
  text("Recovered: " + recovered, statPadding, statYStart + statYSpacing * 3);
  fill(0);
  text("Dead: " + dead, statPadding, statYStart + statYSpacing * 4);

  fill(0);
  text("Day " + dayCount, statPadding, statY + statH - statYSpacing - 5);

  // slider box
  noStroke();
  fill(240, 220);
  rect(220, simHeight - 80, 500, 70, 15);

  //sliders
  textAlign(CENTER, CENTER);
  textSize(17);
  fill(0);
  textStyle(BOLD);
  text("Population " + popSizeSlider.value(), 230 + 65, simHeight - 55);
  text(
    "Vaccination " + vaxPercentSlider.value() + "%",
    230 + 65 + 170,
    simHeight - 55
  );
  if (infectedAtStartSlider.value() == 1) {
    text("1 Initial Infection", 230 + 65 + 170 + 170, simHeight - 55);
  } else {
    text(
      infectedAtStartSlider.value() + " Initial Infections",
      230 + 65 + 170 + 170,
      simHeight - 55
    );
  }
}

function showGraph() {
  fill(225);
  noStroke();
  rect(0, simHeight, width, graphHeight);

  let graphX = 60;
  let graphY = simHeight + 35;
  let graphW = width - 90;
  let graphH = graphHeight - 75;

  // graph title
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(0);
  noStroke();
  text("Measles Outbreak Over Time", width / 2, simHeight + 15);

  // axes
  stroke(0);
  strokeWeight(2);
  line(graphX, graphY, graphX, graphY + graphH);
  line(graphX, graphY + graphH, graphX + graphW, graphY + graphH);

  // x-axis label
  fill(0);
  noStroke();
  textSize(12);
  text("Day", graphX + graphW / 2, graphY + graphH + 30);

  //y-axis label

  // push translate rotate pop rotates the text.
  push();
  translate(18, graphY + graphH / 2); // text position
  rotate(-HALF_PI);
  text("% of People", 0, 0);
  pop();

  //markings

  // y-axis
  for (let i = 0; i <= 10; i++) {
    text(i * 10, graphX - 10, graphY + graphH - (graphH * i) / 10);
  }

  textAlign(CENTER, TOP);
  // x-axis
  for (let i = 0; i <= max(30, dayCount); i += 5) {
    text(i, graphX + i * (graphW / max(30, dayCount)), graphY + graphH + 8);
  }

  // graph the lines
  noFill();
  stroke(sColor);
  beginShape();
  for (let i = 0; i < susceptibleHistory.length; i++) {
    vertex(
      map(i, 0, max(dayCount, 30), graphX, graphX + graphW),
      map(susceptibleHistory[i], 0, 100, graphY + graphH, graphY)
    );
  }
  endShape();

  stroke(eColor);
  beginShape();
  for (let i = 0; i < exposedHistory.length; i++) {
    vertex(
      map(i, 0, max(dayCount, 30), graphX, graphX + graphW),
      map(exposedHistory[i], 0, 100, graphY + graphH, graphY)
    );
  }
  endShape();

  stroke(iColor);
  beginShape();
  for (let i = 0; i < infectiousHistory.length; i++) {
    vertex(
      map(i, 0, max(dayCount, 30), graphX, graphX + graphW),
      map(infectiousHistory[i], 0, 100, graphY + graphH, graphY)
    );
  }
  endShape();

  stroke(rColor);
  beginShape();
  for (let i = 0; i < recoveredHistory.length; i++) {
    vertex(
      map(i, 0, max(dayCount, 30), graphX, graphX + graphW),
      map(recoveredHistory[i], 0, 100, graphY + graphH, graphY)
    );
  }
  endShape();

  stroke(dColor);
  beginShape();
  for (let i = 0; i < deadHistory.length; i++) {
    vertex(
      map(i, 0, max(dayCount, 30), graphX, graphX + graphW),
      map(deadHistory[i], 0, 100, graphY + graphH, graphY)
    );
  }
  endShape();
}

function stepSim(update = true) {
  for (let p of population) {
    if (p.status != "dead") {
      if (update) {
        p.update();
      }
    }
    p.show();
  }

  if (update) {
    for (let p of toExpose) {
      p.expose();
    }
    toExpose = [];
  }
}

function startOrStopSim() {
  if (running) {
    running = false;
    pauseButton.html("▶️");
  } else {
    running = true;
    pauseButton.html("⏸️");
  }
}

function showInfo() {
  
}

function toggleInfo() {
  let overlay = document.getElementById("info-overlay");
  if (overlay.classList.contains("hidden")) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

class Person {
  constructor() {
    this.pos = createVector(random(width), random(simHeight));
    this.noiseValue = 0.01;
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000, 3000);

    this.size = 15;
    this.speed = 5;

    this.vax = true;

    this.hospitalized = false;

    this.status = "susceptible";

    this.exposureTime = exposureTime;
    this.recoveryTime = recoveryTime;
  }

  update() {
    // move
    let nX = noise(this.noiseOffsetX);
    let nY = noise(this.noiseOffsetY);

    if (!this.hospitalized) {
      this.noiseOffsetX += this.noiseValue;
      this.noiseOffsetY += this.noiseValue;
    }

    let vx = map(nX, 0, 1, -this.speed, this.speed);
    let vy = map(nY, 0, 1, -this.speed, this.speed);

    if (!this.hospitalized) {
      this.pos.x += vx;
      this.pos.y += vy;
    }

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = simHeight;
    if (this.pos.y > simHeight) this.pos.y = 0;

    // check if close to other people
    if (this.status == "infectious" && !this.hospitalized) {
      for (let p of population) {
        if (p.status == "susceptible" && abs(this.pos.x - p.pos.x) < interactionDistance &&abs(this.pos.y - p.pos.y) < interactionDistance) {
          if (dist(this.pos.x, this.pos.y, p.pos.x, p.pos.y) < interactionDistance) {
            this.interact(p);
          }
        }
      }
    }

    // become infectious after being exposed
    if (this.status == "exposed") {
      this.exposureTime -= 1;
      if (this.exposureTime <= 0) {
        this.status = "infectious";
        this.recoveryTime = recoveryTime + random(-dayLength, dayLength);
        
        //randomly become hospitalized
        if (this.vax) {
          if (random(1) < hospitalizationRateWithVax) {
            this.hospitalized = true;
          }
        } else {
          if (random(1) < hospitalizationRateNoVax) {
            this.hospitalized = true;
          }
        }
      }
    }

    // recover or die if infected
    if (this.status == "infectious") {
      this.recoveryTime -= 1;
      if (this.recoveryTime <= 0) {
        if (this.vax) {
          if (random(1) < deathChanceIfHospitalized * (1 - vaccinationEffectiveness) && this.hospitalized) {
            this.status = "dead";
            this.hospitalized = false;
          } else {
            this.status = "recovered";
            this.hospitalized = false;
          }
        } else {
          if (random(1) < deathChanceIfHospitalized && this.hospitalized) {
            this.status = "dead";
            this.hospitalized = false;
          } else {
            this.status = "recovered";
            this.hospitalized = false;
          }
        }
      }
    }
  }

  show() {
    // color based on status
    if (this.status == "susceptible") {
      fill(sColor);
    } else if (this.status == "exposed") {
      fill(eColor);
    } else if (this.status == "infectious") {
      fill(iColor);
    } else if (this.status == "recovered") {
      fill(rColor);
    } else if (this.status == "dead") {
      fill(dColor);
    }

    noStroke();
    circle(this.pos.x, this.pos.y, this.size);

    // draws a green circle if vaccinated
    if (this.vax) {
      noFill();
      stroke("green");
      strokeWeight(3);
      circle(this.pos.x, this.pos.y, this.size + 8);
    }

    //draws a white cross if hospitalized
    if (this.hospitalized) {
      fill(255);
      noStroke();
      rect(this.pos.x - 2, this.pos.y - this.size/2, 4, this.size);
      rect(this.pos.x - this.size/2, this.pos.y - 2, this.size, 4);
    }
  }

  interact(p) {
    if (p.vax) {
      if (random(1) < spreadChancePerFrame * (1 - vaccinationEffectiveness)) {
        if (!toExpose.includes(p)) {
          toExpose.push(p);
        }
      }
    } else {
      if (random(1) < spreadChancePerFrame) {
        if (!toExpose.includes(p)) {
          toExpose.push(p);
        }
      }
    }
  }

  expose() {
    this.status = "exposed";
    this.exposureTime = exposureTime + random(-dayLength, dayLength);
  }
}
