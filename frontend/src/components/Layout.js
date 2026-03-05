import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-inner fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
