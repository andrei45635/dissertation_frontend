import { Routes } from '@angular/router';
import { UploadPageComponent } from './pages/upload/upload-page.component';
import { ResultsPageComponent } from './pages/results/results-page.component';
import { HistoryPageComponent } from './pages/history/history-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: UploadPageComponent },
  { path: 'results/:jobId', component: ResultsPageComponent },
  { path: 'history', component: HistoryPageComponent }
];
