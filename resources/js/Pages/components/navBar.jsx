import { useState, useEffect, useRef } from 'react';
import { Home, Package, ShoppingCart, Users, User, FileText, CreditCard, Settings, Cherry, Truck, Sigma, LogOut, Factory, PackagePlus } from 'lucide-react';
import logoExtrait from '../Auth/assets/icons/logo.svg';
import { Link, usePage, router } from '@inertiajs/react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, path: '/dashboard-admin' },
  { id: 'commandes', label: 'Commandes', icon: <CreditCard size={18} />, path: '/commandes/admin' },
  { id: 'produits', label: 'Produits', icon: <Package size={18} />, path: '/produits/admin' },
  { id: 'Ingredient', label: 'Ingredients', icon: <Cherry size={18} />, path: '/ingredients/admin' },
  { id: 'production-lab', label: 'Production', icon: <Factory size={18} />, path: '/productions/admin' },
  { id: 'Fournisseur', label: 'Fournisseurs', icon: <Truck size={18} />, path: '/fournisseurs/admin' },
  { id: 'Formule', label: 'Formules', icon: <Sigma size={18} />, path: '/formules/admin' },
  { id: 'Reaprovisionnement', label: 'Réapprovision', icon: <PackagePlus size={18} />, path: '/reapprovisionnements/admin' },
  { id: 'ventes', label: 'Ventes', icon: <ShoppingCart size={18} />, path: '/ventes/admin' },
  { id: 'employe', label: 'Employés', icon: <Users size={18} />, path: '/employes/admin' },
  { id: 'clients', label: 'Clients', icon: <User size={18} />, path: '/clients/admin' },
  { id: 'rapports', label: 'Rapports', icon: <FileText size={18} />, path: '/rapport/admin' },
  { id: 'acces-utilisateur', label: 'Accès utilisateur', icon: <Settings size={18} />, path: '/accesutilisateur/admin' },
  { id: 'attribution', label: 'Attributions', icon: <User size={18} />, path: '/attribution/admin' },
];

export default function Navbar() {
  const { url, props } = usePage();
  const user = props?.auth?.user;

  const isSuperAdmin = user?.role === 'superadmin';
  const userPermissions = isSuperAdmin ? menuItems.map(item => item.id) : (user?.permissions || []);

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [active, setActive] = useState('dashboard');

  const navbarRef = useRef(null);

  const handleLogout = () => {
    router.post('/logout');
  };

  useEffect(() => {
    const matchingItem = menuItems.find(item => url.startsWith(item.path));
    setActive(matchingItem?.id || 'dashboard');
  }, [url]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMenuContent = () => (
    <div className="flex flex-col h-full">
      
      {/* HEADER COMPACTÉ */}
      <div className="sticky top-0 bg-black z-20">
        <div className="flex items-center justify-between mb-1 pt-5 pb-5">
          <div className="flex items-center">
            <img src={logoExtrait} className="w-8 h-8 mr-2 rounded-full" />
            <span className="text-md font-semibold">Admin Panel</span>
          </div>
          {!isDesktop && (
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white text-lg"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* BARRE DORÉE MINCE */}
        <div className="h-[2px] bg-[#D4AF37] w-full rounded" />
      </div>

      {/* MENU SANS SCROLL */}
      <nav className="flex-1 mt-1">
        <ul className="space-y-1 w-full">
        {menuItems
          .filter(item => user?.role === 'superadmin' || userPermissions.includes(item.id))
          .map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                onClick={() => !isDesktop && setIsOpen(false)}
                className={`flex items-center w-full px-2 py-[6px] rounded gap-2 text-[15px]
                  ${active === item.id ? 'bg-[#D4AF37] text-white font-semibold' : 'hover:bg-gray-800'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          {/* LOGOUT */}
          <li className="mt-2 border-t border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-2 py-6 rounded gap-2 hover:bg-red-900/50 text-red-400 text-sm"
            >
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {!isDesktop && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-white text-black p-2 rounded shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isDesktop && (
        <aside className="bg-black text-white h-screen w-56 p-3 shadow-md fixed left-0 top-0 z-40 flex flex-col">
          {renderMenuContent()}
        </aside>
      )}

      {!isDesktop && isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-opacity-10" onClick={() => setIsOpen(false)}></div>

          <aside className="relative bg-black text-white w-64 h-screen p-3 shadow-md flex flex-col">
            {renderMenuContent()}
          </aside>
        </div>
      )}
    </>
  );
}
