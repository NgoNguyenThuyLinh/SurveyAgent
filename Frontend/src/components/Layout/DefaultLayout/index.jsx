export { default } from './DefaultLayout';
export { default as Navbar } from './Navbar';
export { default as Sidebar } from './Sidebar';
export { default as ProtectedRoute, PublicRoute } from './ProtectedRoute';

        <div className={styles.row}>
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className={`${styles.sidebarCol}`}>
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className={styles.mainCol}>
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefaultLayout;
