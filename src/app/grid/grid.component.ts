import { Component } from '@angular/core';

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

  readonly simulationInterval = setInterval(() => {
    this.updateGrid();
  }, 1000);

  constructor() {
    this.initializeGrid();
  }

  ngOnInit(): void {}

  initializeGrid(): void {
    for (let i = 0; i < this.numRows; i++){
      this.grid[i] = Array(this.numCols).fill(CaseState.Forest); // On remplit toutes les cases de Forêt
    }

    // Une case devient en feu
    this.grid[2][2] = CaseState.Fire;
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

    this.grid = updatedGrid;

    if (!fireExists){
      clearInterval(this.simulationInterval);
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

