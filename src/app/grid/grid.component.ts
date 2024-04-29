import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

enum CaseState {
  Forest,
  Fire,
  Ash
}

interface GridConfig {
  gridDimensions: {
    numRows: number;
    numCols: number;
  };
  initialFirePositions: { row: number; col: number }[];
  propagationProbability: number;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  grid: CaseState[][] = []; // Tableau d'enumération
  config!: GridConfig;
  simulationInterval: any;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }

  /**
   * Méthode qui charge le fichier configuration
   */
  loadConfig(): void {
    this.http.get<GridConfig>('assets/gridConfig.json').subscribe(
      (data) => {
        this.config = data;
        this.initializeGrid();
      },
      (error) => {
        console.error('Error loading simulation configuration:', error);
      }
    );
  }

  /**
   * Méthode qui initialise la grille de départ
   */
  initializeGrid(): void {
    const { numRows, numCols } = this.config.gridDimensions;
    this.grid = new Array(numRows).fill([]).map(() => new Array(numCols).fill(CaseState.Forest));

    for (const pos of this.config.initialFirePositions) {
      const { row, col } = pos;
      if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
        this.grid[row][col] = CaseState.Fire;
      }
    }
  }

  /**
   * Méthode qui met à jour la grille selon la simulation
   */
  updateGrid(): void {
    let fireExists = false;

    // Initialisation d'une grille temporaire qui recoit les modifications
    let updatedGrid: CaseState[][] = [];
    for (let i = 0; i < this.grid.length; i++) {
      updatedGrid[i] = [...this.grid[i]]; 
    }

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
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

    // On stop la simulation s'il n'y a plus de feu
    if (!fireExists){
      this.stopSimulation();
    }
  }

  /**
   *   Méthode qui simule la propagtion du feu
   * @param grid La grille à mettre à jour 
   * @param row le numéro de ligne
   * @param col le numéro de colonne
   */
  propagateFire(grid: CaseState[][], row: number, col: number): void {
    const { numRows, numCols } = this.config.gridDimensions;
    const { propagationProbability } = this.config;
    
    if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
      if (grid[row][col] == CaseState.Forest && Math.random() < propagationProbability) {
        grid[row][col] = CaseState.Fire;
      }
    }
  }

  /**
   * Méthode qui lance la simulation
   */
  launchSimulation(): void {
    this.simulationInterval = setInterval(() => {
      this.updateGrid();
    }, 1000);
  }

  /**
   * Méthode qui stop la simulation
   */
  stopSimulation(): void {
    clearInterval(this.simulationInterval);
  }

  /**
   * Méthode qui retourne la bonne class css pour la case donné
   * @param caseState 
   * @returns 
   */
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

