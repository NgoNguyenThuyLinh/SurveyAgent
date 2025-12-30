import React, { useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOut, faHome, faCog, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.scss';

function Header() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`${styles.header}`}>
      <div className={styles.container}>
        <div 
          onClick={() => navigate('/')}
          className={styles.brand}
        >
          <span className={styles.brandText}>AllMTags</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>

        {/* Navigation */}
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          {state.isAuthenticated && state.user && (
            <>
              <button 
                onClick={() => navigate('/dashboard')}
                className={styles.navLink}
              >
                <FontAwesomeIcon icon={faHome} className={styles.icon} />
                <span>Dashboard</span>
              </button>

              {/* User Dropdown */}
              <div className={styles.dropdownContainer}>
                <button
                  className={styles.dropdownToggle}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                >
                  <FontAwesomeIcon icon={faUser} className={styles.icon} />
                  <span>{state.user.name || state.user.email}</span>
                  <span className={styles.chevron}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <small className={styles.userEmail}>{state.user.email}</small>
                    </div>
                    <hr className={styles.divider} />
                    <button 
                      onClick={() => navigate('/profile')}
                      className={styles.dropdownItem}
                    >
                      <FontAwesomeIcon icon={faCog} className={styles.icon} />
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                      <FontAwesomeIcon icon={faSignOut} className={styles.icon} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
