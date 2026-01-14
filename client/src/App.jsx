import { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Sparkles, ArrowRight, Navigation, Clock, ExternalLink, Globe, Loader2, Search, History, User, LogOut, X, Plane } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// --- HISTORY MODAL ---
const HistoryModal = ({ isOpen, onClose, history, onLoadTrip }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-3xl p-6 md:p-8 relative shadow-2xl ring-1 ring-white/5">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <History className="w-6 h-6 text-sky-400" /> Trip History
        </h2>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
              <p>No trips saved yet.</p>
              <p className="text-sm mt-1">Generate a trip to see it here.</p>
            </div>
          ) : (
            history.map((savedTrip, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-sky-500/30 transition-all group">
                <div>
                  <h3 className="font-bold text-white text-lg">{savedTrip.trip_details?.destination}</h3>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1 uppercase tracking-wide font-semibold">
                    <span>{savedTrip.trip_details?.duration}</span>
                    <span className="text-slate-600">•</span>
                    <span>{savedTrip.trip_details?.budget}</span>
                  </div>
                </div>
                <button
                  onClick={() => { onLoadTrip(savedTrip); onClose(); }}
                  className="px-5 py-2 bg-sky-500/10 text-sky-400 rounded-lg text-sm font-bold group-hover:bg-sky-500 group-hover:text-white transition-all"
                >
                  Load
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const SkeletonLoader = () => (
  <div className="w-full px-8 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse mt-12">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-[500px] bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/5"></div>
    ))}
  </div>
);

function App() {
  const [formData, setFormData] = useState({ destination: '', days: 3, budget: 'Moderate', interests: '' });
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop");

  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('tripHistory');
    if (saved) setTripHistory(JSON.parse(saved));

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleExplore = () => {
    const destinations = [
      { name: "Kyoto, Japan", interests: "Temples, Sushi, Nature" },
      { name: "Reykjavik, Iceland", interests: "Aurora, Hiking, Geysers" },
      { name: "Santorini, Greece", interests: "Sunsets, Wine, Beaches" },
      { name: "Amalfi Coast, Italy", interests: "Luxury, Pasta, Views" },
      { name: "Queenstown, NZ", interests: "Adventure, Mountains" }
    ];
    const random = destinations[Math.floor(Math.random() * destinations.length)];
    setFormData({ ...formData, destination: random.name, interests: random.interests });
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Failed", error);
    }
  }

  const saveTrip = (newTrip) => {
    const updated = [newTrip, ...tripHistory].slice(0, 10);
    setTripHistory(updated);
    localStorage.setItem('tripHistory', JSON.stringify(updated));
  };

  const generateTrip = async () => {
    if (!formData.destination.trim()) return;
    setLoading(true); setError(''); setTrip(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });

    setBgImage(`https://image.pollinations.ai/prompt/cinematic%20drone%20shot%20of%20${encodeURIComponent(formData.destination)}%20luxury%20travel%204k?width=1920&height=1080&nologo=true`);

    try {
      const response = await fetch('https://travel-planner-ai-2fi0.onrender.com/api/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTrip(data);
      saveTrip(data);

    } catch (err) {
      setError("Unable to connect to the travel engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-slate-100 font-sans antialiased selection:bg-sky-500/30">

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-30 transition-opacity duration-1000 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/20"></div>
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"></div>
      </div>

      {/* --- MODAL --- */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={tripHistory}
        onLoadTrip={(saved) => {
          setTrip(saved);
          setBgImage(`https://image.pollinations.ai/prompt/cinematic%20drone%20shot%20of%20${encodeURIComponent(saved.trip_details.destination)}%20luxury%20travel%204k?width=1920&height=1080&nologo=true`);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

      {/* --- NAV --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-white/0 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-xl h-20 border-white/5 shadow-2xl' : 'bg-transparent h-24'}`}>
        <div className="w-full px-8 md:px-16 h-full flex justify-between items-center">

          {/* LOGO SECTION */}
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="relative bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
              <Globe className="w-6 h-6 text-white" />
              <Plane className="w-3 h-3 text-white absolute top-1 right-1" />
            </div>
            <span className="text-white text-xl">Travel<span className="text-sky-400">AI</span></span>
          </div>

          <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-300 items-center">
            <button onClick={handleExplore} className="flex items-center gap-2 hover:text-white transition-colors">
              <Sparkles className="w-4 h-4 text-sky-400" /> Explore
            </button>
            <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 hover:text-white transition-colors">
              <History className="w-4 h-4 text-sky-400" /> My Trips
            </button>
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10 animate-in fade-in">
                <div className="text-right hidden lg:block">
                  <p className="text-white leading-none">{user.displayName}</p>
                  <button onClick={handleLogout} className="text-[10px] text-sky-400 hover:underline">Sign Out</button>
                </div>
                <img src={user.photoURL || "https://ui-avatars.com/api/?name=User"} alt="User" className="w-10 h-10 rounded-full border-2 border-sky-500/50 shadow-lg" />
              </div>
            ) : (
              <button onClick={handleGoogleLogin} className="text-white bg-white/10 px-6 py-2.5 rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
                <User className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 w-full px-4 md:px-16 pt-32 pb-20">

        {/* --- HERO SECTION --- */}
        <div className="text-center mb-24 space-y-6">
          <h1 className="text-5xl md:text-9xl font-black tracking-tight text-white drop-shadow-2xl leading-[0.9]">
            Instant Itineraries. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">Infinite Memories.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Stop planning. Start living. Let our AI craft your perfect, photo-rich journey in seconds—while you handle the packing.
          </p>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="w-full max-w-6xl mx-auto mb-32">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-2xl ring-1 ring-white/5">

            <div className="md:col-span-4 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-colors border border-white/0 focus-within:border-sky-500/30 focus-within:bg-white/10 relative group">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1 block">Where to?</label>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g. Kyoto, Japan" className="bg-transparent w-full text-xl font-medium focus:outline-none placeholder-slate-600 text-white" />
              </div>
            </div>

            <div className="md:col-span-2 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-colors group border border-white/0 focus-within:border-sky-500/30">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1 block">Duration</label>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                <input type="number" name="days" value={formData.days} onChange={handleChange} className="bg-transparent w-full text-xl font-medium focus:outline-none text-white" min="1" max="15" />
              </div>
            </div>

            <div className="md:col-span-2 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-colors group border border-white/0 focus-within:border-sky-500/30">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1 block">Budget</label>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                <select name="budget" value={formData.budget} onChange={handleChange} className="bg-transparent w-full text-xl font-medium focus:outline-none cursor-pointer appearance-none text-white [&>option]:bg-slate-900">
                  <option value="Cheap">Economy</option>
                  <option value="Moderate">Standard</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3 bg-white/5 rounded-2xl px-6 py-4 hover:bg-white/10 transition-colors group border border-white/0 focus-within:border-sky-500/30">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1 block">Vibe</label>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="Food, Art..." className="bg-transparent w-full text-xl font-medium focus:outline-none placeholder-slate-600 text-white" />
              </div>
            </div>

            <button onClick={generateTrip} disabled={loading} className="md:col-span-1 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-sky-500/20">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- RESULTS AREA --- */}
        {trip && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 w-full">

            <div className="flex flex-col md:flex-row items-end justify-between mb-16 border-b border-white/10 pb-12 gap-8">
              <div>
                <h2 className="text-6xl md:text-9xl font-black text-white mb-4 tracking-tighter">{trip.trip_details?.destination}</h2>
                <p className="text-2xl text-slate-400 font-light max-w-4xl leading-relaxed">"{trip.trip_details?.summary}"</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-base font-semibold backdrop-blur-md flex items-center gap-3 text-slate-200">
                  <Calendar className="w-5 h-5 text-sky-400" /> {trip.trip_details?.duration}
                </div>
                <div className="px-6 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-base font-semibold backdrop-blur-md flex items-center gap-3 text-slate-200">
                  <DollarSign className="w-5 h-5 text-sky-400" /> {trip.trip_details?.budget}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {trip.itinerary?.map((day, index) => (
                <div key={index} className="flex flex-col gap-8">

                  <div className="sticky top-24 z-20 bg-[#020617]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-bold text-white">Day {day.day}</h3>
                      <span className="text-xs font-bold bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full uppercase tracking-widest border border-sky-500/20">{day.theme}</span>
                    </div>
                  </div>

                  {day.activities.map((activity, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-sky-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2">

                      <div className="h-64 w-full overflow-hidden relative bg-slate-950">
                        <img
                          src={`https://image.pollinations.ai/prompt/cinematic%20photo%20of%20${encodeURIComponent(activity.place)}%20in%20${encodeURIComponent(formData.destination)}?width=800&height=600&nologo=true`}
                          alt={activity.place}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 text-white flex items-center gap-2">
                          <Clock className="w-3 h-3 text-sky-400" /> {activity.time}
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h4 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors leading-tight">{activity.place}</h4>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed mb-8 line-clamp-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            <Navigation className="w-3 h-3" /> {activity.location_area || "City Center"}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.map_query)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-sky-500 hover:text-black transition-all text-white border border-white/10 hover:border-transparent group/btn"
                            title="View on Map"
                          >
                            <ArrowRight className="w-5 h-5 -rotate-45 group-hover/btn:rotate-0 transition-transform" />
                          </a>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <SkeletonLoader />}

        {error && (
          <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-500/10 border border-red-500/20 text-red-400 text-center rounded-3xl backdrop-blur-xl">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;