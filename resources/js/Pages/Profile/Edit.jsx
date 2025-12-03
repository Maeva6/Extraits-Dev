import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React from "react";
import { router, usePage, Link } from "@inertiajs/react";
// import { Head } from '@inertiajs/react';
import { motion } from "framer-motion";
import Header from "../Header";
import Footer from "../Footer";
import { Heart, PackageCheck, LogOut, Lock } from "lucide-react";
import { useState } from "react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
      const handleLogout = () => {
    router.post(route("logout"));
  };

      const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { auth, favorites = [], orders = [] } = usePage().props;
            const truncate = (str, n) =>
    str.length > n ? str.substring(0, n - 1) + "…" : str;
    console.log("📦 Données commandes :", orders);
    console.log("❤️ Données favoris :", favorites);
    return (
        <AuthenticatedLayout
            // header={
            //     <h2 className="text-xl font-semibold leading-tight text-gray-800">
            //         Profile
            //     </h2>
            // }
        >
            {/* <Head title="Profile" /> */}


        

  {/* return ( */}
    <div className="min-h-screen flex flex-col pt-24 bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-6 font-montserrat font-bold text-align:center">
        <h1 className="text-2xl font-bold text-yellow-600">
          Bienvenue, {auth?.user?.name} 👋
        </h1>

        {/* <div>
          <p className="text-sm text-gray-600">Adresse e-mail :</p>
          <p className="font-semibold">{auth?.user?.email}</p>
        </div> */}

        <div className="space-y-6">
          {/* Favoris */}
          
          <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  <Link href="/mes-favoris" className="flex items-center text-yellow-600 gap-2 hover:underline text-lg">
   <Heart size={20} />
     Mes favoris
  </Link>
  <div className="flex gap-3 mt-2">
    {favorites.map((fav) => {
      const item = fav.produit || fav.accessoire || fav.service;
      const type = fav.produit
        ? "produit"
        : fav.accessoire
        ? "accessoire"
        : "service";

      if (!item) return null;

      return (
        <Link key={`${type}-${item.id}`} href={`/${type}/${item.id}`} className="text-center">
          <img
            src={item.imagePrincipale || item.imageUrl || item.image || '/images/default.png'}
            alt={item.nomProduit || item.nomAccessoire || item.nom}
            className="w-20 h-20 object-cover rounded-lg shadow"
          />
          {/* <p className="text-sm mt-1">
            {item.nomProduit || item.nomAccessoire || item.nom}
          </p> */}
        </Link>
      );
    })}
  </div>
</motion.div>


          {/* Historique de commandes */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
>
  <Link href="/mes-commandes" className="flex items-center text-yellow-600 gap-2 hover:underline text-lg">
    <PackageCheck size={20} />
    Historique de mes commandes
  </Link>

  <div className="flex gap-3 mt-2 flex-wrap">
    {orders.slice(0, 3).flatMap((commande) => {
      const items = [
        ...(commande.produits || []),
        ...(commande.accessoires || []),
        ...(commande.services || [])
      ];

      return items.map((item) => {
        const type = item.nomProduit
          ? 'produit'
          : item.nomAccessoire
          ? 'accessoire'
          : 'service';

        const image =
          item.imagePrincipale || item.imageUrl || item.image || '/images/default.png';

        const nom =
          item.nomProduit || item.nomAccessoire || item.nom;

        return (
          <div key={`${commande.id}-${type}-${item.id}`} className="text-center">
            <img
              src={image}
              alt={nom}
              className="w-20 h-20 object-cover rounded-lg shadow"
            />
            {/* <p className="text-sm mt-1">{nom}</p> */}
          </div>
        );
      });
    })}
  </div>
</motion.div>


          {/* Changer mot de passe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* <Link href={route('profile.update')} className="flex items-center text-yellow-700 gap-2 hover:underline text-lg">
  <Lock size={20} />
  Changer mon mot de passe
</Link> */}
{/* <h2 className="text-lg font-semibold mb-2">Changer le mot de passe</h2> */}

{/* <button
  onClick={() => setShowPasswordForm(!showPasswordForm)}
  className="flex items-center gap-2 text-yellow-600 hover:underline text-lg"
>
  <Lock size={20} />
  {showPasswordForm ? "Changer le mot de passe" : "changer le mot de passe"}
</button>

{showPasswordForm && (
  <div className="mt-4">
    <UpdatePasswordForm />
  </div>
)} */}



            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Déconnexion */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-red-600 text-sm hover:underline mt-6"
          >
            <LogOut size={18} />
            Se déconnecter
          </motion.button>
        </div>
        
      </div>

      
      <Footer />
    </div>
    </AuthenticatedLayout>
  );
}

