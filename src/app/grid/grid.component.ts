import { Component, OnDestroy } from '@angular/core';

enum CaseState {
  Forest,
  Fire,
  Ash
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  numRows = 6; // Nombre de lignes de la grille
  numCols = 6;// Nombre de colonnes de la grille
  grid: CaseState[][] = []; // Tableau d'enumération
  probability = 0.75; //Probabilité qu'une case Forêt s'enflamme

  currentStep = 0;
  allSteps = new Map();

  simulationInterval: any;

  constructor() {
    this.initializeGrid();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopSimulation();
  }

  initializeGrid(): void {
    for (let i = 0; i < this.numRows; i++){
      this.grid[i] = Array(this.numCols).fill(CaseState.Forest); // On remplit toutes les cases de Forêt
    }

    // Choisir aléatoirement entre 1 et 3 positions pour démarrer le feu
    const numFires = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numFires; i++) {
      const randomRow = Math.floor(Math.random() * this.numRows);
      const randomCol = Math.floor(Math.random() * this.numCols);
      this.grid[randomRow][randomCol] = CaseState.Fire;
    }

    this.allSteps.set(this.currentStep, this.grid);
  }

  updateGrid(): void {
    let fireExists = false;

    let updatedGrid: CaseState[][] = [];

    for (let i = 0; i < this.numRows; i++) {
      updatedGrid[i] = [...this.grid[i]]; 
    }

    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        switch (this.grid[i][j]) {
          case CaseState.Forest: 
            break;

          case CaseState.Fire:
            fireExists = true;

            // Propager le feu aux cases adjacentes
            this.propagateFire(updatedGrid, i - 1, j);
            this.propagateFire(updatedGrid, i + 1, j);
            this.propagateFire(updatedGrid, i, j - 1);
            this.propagateFire(updatedGrid, i, j + 1);

            // La case devient cendre
            updatedGrid[i][j] = CaseState.Ash;
            break;

          case CaseState.Ash:
            break;
        }
      }
    }

    this.currentStep +=1;
    this.allSteps.set(this.currentStep, updatedGrid);

    this.grid = updatedGrid;

    if (!fireExists){
      this.stopSimulation();
    }
  }

  propagateFire(grid: CaseState[][], row: number, col: number): void {
    // Vérifier si la case existe
    if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
      // Vérifier si la case est une Forêt
      if (grid[row][col] == CaseState.Forest) {
        // Propager le feu selon la probabilité
        if (Math.random() < this.probability) {
          grid[row][col] = CaseState.Fire;
        }
      }
    }
  }

  launchSimulation(): void {
    this.simulationInterval = setInterval(() => {
      this.updateGrid();
    }, 1000);
  }

  stopSimulation(): void {
    clearInterval(this.simulationInterval);
  }

  getCaseStateClass(caseState: CaseState): string {
    switch (caseState) {
      case CaseState.Forest :
        return 'forest';
      case CaseState.Fire :
        return 'fire';
      case CaseState.Ash :
        return 'ash';
      default :
        return '';
    }
  }
}

