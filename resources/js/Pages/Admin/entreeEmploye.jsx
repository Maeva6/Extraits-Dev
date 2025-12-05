
import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Navbar from "../components/navBar";

export default function AccesUtilisateur() {
    const { props } = usePage();
    const user = props.user;

    return (
        <div className="min-h-screen">
            <div className="flex w-full">
                <Navbar />
                <div className="w-0 lg:w-[225px] bg-red"></div>
                <div className="flex-1 bg-gray-100 w-full">
                    <div className="p-6 space-y-8 min-h-screen flex flex-col items-center justify-center">
                        <div className="text-center max-w-2xl bg-white p-8 rounded-lg shadow-lg">
                            {/* Icône ou illustration */}
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg 
                                        className="w-12 h-12 text-yellow-600" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                                        />
                                    </svg>
                                </div>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                Configuration des droits d'accès requise
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                Votre compte employé a été créé avec succès, mais aucun droit d'accès n'a encore été configuré.
                            </p>
                            
                            <p className="text-gray-500 text-sm mb-8">
                                Un administrateur doit définir vos permissions avant que vous puissiez accéder aux fonctionnalités du système.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    href="/logout" 
                                    method="post"
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Se déconnecter
                                </Link>
                                
                                <Link 
                                    href="/contact-admin" 
                                    className="bg-[#D4AF37] hover:bg-yellow-600 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Contacter l'administrateur
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}