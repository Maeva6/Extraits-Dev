import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { usePage, Link } from '@inertiajs/react';
import { Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Navbar from "../components/navBar";

export default function Contact({user}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState(new Map()); // Cache pour les données

  // Fonction pour obtenir les dates de la semaine (mémoïsée)
  const getWeekDates = useCallback((weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + 1 + (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
  }, []);

  // Fonction pour formater la période de la semaine
  const formatWeekPeriod = useCallback((start, end) => {
    const options = { day: 'numeric', month: 'long' };
    return `Semaine du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`;
  }, []);

  // Fonction pour charger les stats avec cache et optimisation
  const fetchStats = useCallback(async (start = null, end = null) => {
    if (!start || !end) return;

    const cacheKey = `${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}`;
    
    // Vérifier le cache d'abord
    if (cache.has(cacheKey)) {
      setStats(cache.get(cacheKey));
      return;
    }

    try {
      setLoading(true);
      let url = '/admin/client-stats';
      
      const params = new URLSearchParams();
      params.append('start_date', start.toISOString().split('T')[0]);
      params.append('end_date', end.toISOString().split('T')[0]);
      
      url += `?${params.toString()}`;

      const response = await axios.get(url, {
        timeout: 5000, // Timeout de 5 secondes
        headers: {
          'Cache-Control': 'max-age=300' // Cache côté client
        }
      });
      
      const data = response.data;
      setStats(data);
      
      // Mettre en cache les données
      setCache(prev => new Map(prev.set(cacheKey, data)));
      
    } catch (error) {
      console.error("Erreur lors du chargement des stats clients :", error);
      // Option: Afficher les données en cache si disponibles pour une semaine similaire
    } finally {
      setLoading(false);
    }
  }, [cache]);

  // Précharger les semaines adjacentes
  const preloadAdjacentWeeks = useCallback((currentWeek) => {
    const weeksToPreload = [currentWeek - 1, currentWeek + 1];
    
    weeksToPreload.forEach(weekOffset => {
      const { start, end } = getWeekDates(weekOffset);
      const cacheKey = `${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}`;
      
      if (!cache.has(cacheKey)) {
        // Précharger en arrière-plan sans attendre le résultat
        axios.get(`/admin/client-stats?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`)
          .then(response => {
            setCache(prev => new Map(prev.set(cacheKey, response.data)));
          })
          .catch(() => {}); // Ignorer les erreurs de préchargement
      }
    });
  }, [getWeekDates, cache]);

  // Charger les stats pour la semaine en cours
  useEffect(() => {
    const { start, end } = getWeekDates(currentWeek);
    setStartDate(start);
    setEndDate(end);
    fetchStats(start, end);
    
    // Précharger les semaines adjacentes
    preloadAdjacentWeeks(currentWeek);
  }, [currentWeek, fetchStats, getWeekDates, preloadAdjacentWeeks]);

  // Navigation entre les semaines
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setCurrentWeek(0);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setCurrentWeek(0);
  };

  // Custom Tooltip pour le graphique
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { start } = getWeekDates(currentWeek);
      const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const dayIndex = jours.indexOf(label);
      
      if (dayIndex !== -1) {
        const date = new Date(start);
        date.setDate(start.getDate() + dayIndex);
        
        return (
          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-sm text-gray-600">{date.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p className="text-[#D4AF37] font-bold">
              {payload[0].value} client(s)
            </p>
          </div>
        );
      }
    }
    return null;
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(currentWeek);

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="w-0 lg:w-[225px] bg-red"></div>
        <div className="flex-1 bg-gray-100 w-full">
          <div className="p-6 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-yellow-400 pb-2">
              <h1 className="text-xl font-bold">DASHBOARD</h1>
              <div className="flex items-center gap-4">
                <Link href="#"><User size={24} color="#D4AF37" /></Link>
                <span className="font-semibold">{user?.name || 'Admin'}</span>
              </div>
            </div>

            {/* Semaine actuelle et navigation */}
            <div className="bg-white p-4 rounded shadow">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-gray-700 text-lg">
                    {formatWeekPeriod(weekStart, weekEnd)}
                  </h3>
                  {currentWeek === 0 && (
                    <p className="text-sm text-green-600">Semaine en cours</p>
                  )}
                  {loading && (
                    <p className="text-sm text-blue-600">Chargement...</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousWeek}
                    disabled={loading}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Semaine précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button
                    onClick={handleCurrentWeek}
                    disabled={loading || currentWeek === 0}
                    className="px-3 py-2 bg-[#D4AF37] text-white rounded hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Aujourd'hui
                  </button>
                  
                  <button
                    onClick={handleNextWeek}
                    disabled={loading}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Semaine suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Graphique dynamique */}
            <div className="bg-white shadow rounded">
              <h2 className="bg-[#D4AF37] text-black font-semibold px-2 py-1 rounded-t">
                Statistiques hebdomadaires du nombre de clients
                {loading && (
                  <span className="ml-2 text-sm font-normal">(Chargement...)</span>
                )}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="clients" fill="#D4AF37" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}