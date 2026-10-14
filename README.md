# Measles Simulation

Measles Simulation is an interactive website that models how measles can spread through a population and how vaccination rates can affect an outbreak.

I built this project to explore disease modeling and make it easier for people to understand how outbreaks develop. I researched measles and used real-world statistics to help guide the values and rules used in the simulation.

Users can adjust settings like population size, vaccination percentage, and the number of people infected at the start. They can then run the simulation, watch individuals move between disease stages, and follow the results on a graph. There's also an information page that explains the model.

The simulation uses a SEIRD model, which tracks five disease states: Susceptible, Exposed, Infectious, Recovered, and Dead. It also uses probability to model infection and Perlin noise to create smoother movement.

I built the project using JavaScript and p5.js. The goal is to give students, teachers, and anyone interested in public health a way to experiment with different scenarios and see how changing variables can affect an outbreak.

Try it out: [measlessim.com](https://measlessim.com)
