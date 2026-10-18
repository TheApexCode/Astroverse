import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Calendar, Clock, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Send } from 'lucide-react';
import { UPCOMING_CELESTIAL_EVENTS } from '../../data/eventsData';
import { CelestialEvent } from '../../types/astronomy';
import { loadProfile, saveProfile } from '../../utils/storage';

export const CelestialAlerts: React.FC = () => {
  const [events, setEvents] = useState<CelestialEvent[]>(UPCOMING_CELESTIAL_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [notificationsGranted, setNotificationsGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request Push Notification Permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setToastMessage('Push notifications are not supported in this browser.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        const profile = loadProfile();
        profile.notificationsEnabled = true;
        saveProfile(profile);

        // Send confirmation welcome notification
        new Notification('Astroverse Celestial Alerts Active', {
          body: 'You will receive real-time alerts for meteor showers, planetary alignments, and eclipses!',
          icon: '/pwa-192x192.png',
        });
        setToastMessage('Celestial push notifications enabled!');
      } else {
        setNotificationsGranted(false);
        setToastMessage('Notification permission was dismissed or blocked.');
      }
    } catch (err) {
      console.warn('Notification error:', err);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Test Notification Trigger
  const triggerTestAlert = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Orionid Meteor Shower Alert ☄️', {
        body: 'Peak activity expected tonight! Look toward Orion after midnight. Estimated ZHR: 20 meteors/hr.',
        icon: '/pwa-192x192.png',
      });
      setToastMessage('Test celestial push notification sent!');
    } else {
      setToastMessage('Please enable notifications first to test alert dispatch.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.type === selectedFilter;
  });

  // Calculate live countdown to event
  const getCountdownString = (peakTimeUTC: string): string => {
    const diff = new Date(peakTimeUTC).getTime() - Date.now();
    if (diff <= 0) return 'Peak Event Underway / Passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `T-minus ${days}d ${hours}h`;
    return `T-minus ${hours}h`;
  };

  return (
    <div className="w-full bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header & Push Notification Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium flex items-center gap-1.5 w-fit">
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            REAL-TIME CELESTIAL ALERTS & PUSH SYSTEM
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Astronomical Events & Meteor Showers
          </h2>
          <p className="text-xs text-slate-400">
            Real-time countdowns, visibility forecasts, and automated observer push notifications
          </p>
        </div>

        {/* Notification Settings */}
        <div className="flex items-center gap-2">
          {notificationsGranted ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Alerts Active
              </span>
              <button
                onClick={triggerTestAlert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Alert</span>
              </button>
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Push Notifications</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-950/90 border border-purple-500/50 text-purple-200 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'meteor_shower', label: 'Meteor Showers ☄️' },
          { id: 'opposition', label: 'Oppositions' },
          { id: 'conjunction', label: 'Conjunctions' },
          { id: 'eclipse', label: 'Eclipses 🌑' },
          { id: 'equinox_solstice', label: 'Solstices & Equinoxes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const countdown = getCountdownString(event.peakTimeUTC);
          return (
            <div
              key={event.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-5 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    {event.type.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-white">{event.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono">
                  <span className="text-amber-400 font-semibold block mb-0.5">Observer Tip:</span>
                  {event.viewingTip}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {event.date}
                  </span>
                  <span>•</span>
                  <span>Region: <strong className="text-slate-200">{event.visibilityRegion}</strong></span>
                  {event.expectedZHR && (
                    <>
                      <span>•</span>
                      <span>Peak Rate: <strong className="text-purple-300">{event.expectedZHR} meteors/hr</strong></span>
                    </>
                  )}
                  {event.coordinates && (
                    <>
                      <span>•</span>
                      <span>Radiant: <strong className="text-cyan-300">{event.coordinates}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Countdown Banner */}
              <div className="shrink-0 bg-slate-950/90 border border-purple-500/30 rounded-xl p-3.5 text-center min-w-[170px] self-stretch md:self-auto flex flex-col justify-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Event Countdown
                </span>
                <span className="text-sm font-bold text-purple-300 font-mono mt-1 block">
                  {countdown}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Peak: {new Date(event.peakTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
