import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Sidebar } from './sidebar';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router, Routes } from '@angular/router';

@Component({ standalone: true, template: '' })
class RouteStub {}

const sidebarRoutes: Routes = [
  { path: '', component: RouteStub },
  { path: 'appointment-types', component: RouteStub },
];

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter(sidebarRoutes),
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the sidebar brand information', () => {
    // Arrange
    const sidebar = fixture.nativeElement.querySelector('aside.sidebar');

    // Act
    const title = fixture.nativeElement.querySelector('h2')?.textContent;
    const subtitle = fixture.nativeElement.querySelector('.sidebar-header span')?.textContent;
    const icon = fixture.nativeElement.querySelector('.brand-icon mat-icon')?.textContent;

    // Assert
    expect(sidebar).toBeTruthy();
    expect(title).toContain('Agenda de citas');
    expect(subtitle).toContain('Organiza tus reuniones');
    expect(icon).toContain('event');
  });

  it('renders the navigation links with their routes', () => {
    // Arrange
    const links = Array.from(fixture.nativeElement.querySelectorAll('nav a')) as HTMLAnchorElement[];

    // Act
    const hrefs = links.map((link) => link.getAttribute('href'));
    const labels = links.map((link) => link.textContent?.trim());

    // Assert
    expect(links).toHaveLength(2);
    expect(hrefs).toEqual(['/', '/appointment-types']);
    expect(labels).toEqual(['calendar_monthCitas', 'add_circle_outlineNuevo tipo de cita']);
  });

  it('marks the matching navigation link as active', async () => {
    // Arrange
    const router = TestBed.inject(Router);

    // Act
    await router.navigateByUrl('/appointment-types');
    fixture.detectChanges();
    await fixture.whenStable();
    const links = Array.from(fixture.nativeElement.querySelectorAll('nav a')) as HTMLAnchorElement[];

    // Assert
    expect(links[0].classList.contains('active')).toBe(false);
    expect(links[1].classList.contains('active')).toBe(true);
  });
});
