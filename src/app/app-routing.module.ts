import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { SongsLibraryComponent } from './modules/songs-library/songs-library.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'songs-library', component: SongsLibraryComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
