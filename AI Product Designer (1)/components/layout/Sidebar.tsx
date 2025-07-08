/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  HomeIcon, HomeIconSolid,
  FolderIcon, FolderIconSolid,
  TShirtIcon, TShirtIconSolid,
  TagIcon, TagIconSolid,
  RocketIcon, RocketIconSolid,
  BookOpenIcon, BookOpenIconSolid,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon, SunIcon, MoonIcon 
} from '../icons';
import { NavItem } from '../../types';

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem, isCollapsed, onToggleCollapse, theme, onToggleTheme }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: 'My Projects', icon: FolderIcon, iconSolid: FolderIconSolid },
    { type: 'separator', name: 'sep1', icon: () => null },
    { name: 'Mockup Studio', icon: TShirtIcon, iconSolid: TShirtIconSolid },
    { name: 'Listing Generator', icon: TagIcon, iconSolid: TagIconSolid },
    { name: 'Publish Center', icon: RocketIcon, iconSolid: RocketIconSolid },
    { type: 'separator', name: 'sep2', icon: () => null },
    { name: 'POD Mini Academy', icon: BookOpenIcon, iconSolid: BookOpenIconSolid },
  ];

  return (
    <aside className="sidebar" aria-label="Primary Navigation">
      <div className="logo">
        <img src="https://merchize.com/wp-content/uploads/2022/07/logo.svg" alt="Merchize Logo" className="logo-full" />
        <img src="https://merchize.com/wp-content/uploads/2022/07/logo.svg" alt="Merchize Icon" className="logo-collapsed" />
      </div>
      <nav>
        <ul className="nav-menu">
          {navItems.map((item, index) => {
            if (item.type === 'separator') {
              return <li key={`sep-${index}`} role="separator"><hr className="nav-separator" /></li>;
            }
            const isActive = activeItem === item.name;
            const IconComponent = isActive && item.iconSolid ? item.iconSolid : item.icon;

            return (
              <li key={item.name} className="nav-item">
                <a 
                  href="#" 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.name);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent />
                  <span className="nav-text">{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
         <a 
          href="#" 
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            onToggleTheme();
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          <span className="nav-text">Theme</span>
        </a>
        <a 
          href="#" 
          className="nav-link collapse-toggle-btn"
          onClick={(e) => {
            e.preventDefault();
            onToggleCollapse();
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
          <span className="nav-text">Collapse</span>
        </a>
      </div>
    </aside>
  );
};