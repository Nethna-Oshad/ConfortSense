"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/comfort/PageHeader";
import { Building2, Layers, Clock, UserCheck, CheckCircle2, History, ArrowRight, MapPin } from "lucide-react";

// #NNN: Prototype eka wada karanna hadapu Mock Data
const MOCK_ROOMS = [
  { id: "4b", name: "Lecture Hall 4B", building: "New Building", floor: "4", isFree: true, lecturer: null, endsIn: null },
  { id: "4a", name: "Lecture Hall 4A", building: "New Building", floor: "4", isFree: false, lecturer: "Dr. Nuwan Perera", endsIn: 15 },
  { id: "4c", name: "Lecture Hall 4C", building: "New Building", floor: "4", isFree: true, lecturer: null, endsIn: null },
  { id: "5a", name: "Lecture Hall 5A", building: "New Building", floor: "5", isFree: false, lecturer: "Madam Samanthi", endsIn: 45 },
  { id: "main-1", name: "Main Auditorium", building: "Main", floor: "3", isFree: true, lecturer: null, endsIn: null },
];

export default function LecturerRoomsPage() {
  const router = useRouter();
  
  // #NNN: Default values (New Building saha Floor 4)
  const [selectedBuilding, setSelectedBuilding] = useState("New Building");
  const [selectedFloor, setSelectedFloor] = useState("4");
  
  // #NNN: Countdown ekata live feel ekak denna use karana state eka
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // Hama winadiyatama tick eka wadi wenawa
    return () => clearInterval(timer);
  }, []);

  // #NNN: Filter and Sort Logic (Free halls udata enawa)
  const filteredRooms = MOCK_ROOMS
    .filter(room => room.building === selectedBuilding && room.floor === selectedFloor)
    .sort((a, b) => (a.isFree === b.isFree ? 0 : a.isFree ? -1 : 1));

  // #NNN: Room eka click kalama kalin thibba dashboard ekata yanawa
  const handleRoomSelect = (roomId: string) => {
    // Danata router.push eken api kalin hadapu dashboard page ekata yanawa. 
    // Issarahata meka `/lecturer/room/${roomId}` widiyata wenas karanna puluwan.
    router.push("/lecturer/dashboard");
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-24">
      <PageHeader
        eyebrow="Hall Selection"
        title="Select Your Lecture Hall"
      />

      {/* #NNN: Recently Accessed Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F93B3] flex items-center gap-2">
          <History className="h-4 w-4" /> Recently Accessed
        </h2>
        <div 
          onClick={() => handleRoomSelect("4b")}
          className="group cursor-pointer rounded-2xl border border-[#2B7FE0]/40 bg-gradient-to-br from-[#2B7FE0]/10 to-[#4FB8E8]/5 p-5 transition hover:border-[#4FB8E8] hover:shadow-[0_0_20px_rgba(43,127,224,0.15)] flex items-center justify-between"
        >
          <div>
            <p className="text-xl font-bold text-white group-hover:text-[#4FB8E8] transition">Lecture Hall 4B</p>
            <p className="mt-1 text-xs text-[#7F93B3] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> New Building • Floor 4
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B7FE0]/20 text-[#4FB8E8] transition group-hover:bg-[#4FB8E8] group-hover:text-white">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* #NNN: Filters Section */}
      <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-[#4FB8E8]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Browse Halls</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#7F93B3] uppercase tracking-wide">Building</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7F93B3]" />
              <select 
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#294467]/70 bg-[#0B1220] pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#4FB8E8] transition"
              >
                <option value="New Building">New Building</option>
                <option value="Main">Main Building</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#7F93B3] uppercase tracking-wide">Floor</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7F93B3]" />
              <select 
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#294467]/70 bg-[#0B1220] pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#4FB8E8] transition"
              >
                {/* #NNN: Floor 3 to 10 options */}
                {[3, 4, 5, 6, 7, 8, 9, 10].map(floor => (
                  <option key={floor} value={floor.toString()}>Floor {floor}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* #NNN: Filtered Rooms List */}
      <section className="space-y-3">
        {filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-8 text-center text-[#7F93B3]">
            No lecture halls found on this floor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const currentEndsIn = room.endsIn ? Math.max(0, room.endsIn - tick) : 0;
              
              return (
                <div 
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all hover:scale-[1.02] ${
                    room.isFree 
                      ? "border-[#3DDC84]/30 bg-[#0B1220] hover:border-[#3DDC84] hover:shadow-[0_0_15px_rgba(61,220,132,0.1)]" 
                      : "border-[#294467]/60 bg-[#0E1C30]/50 hover:border-[#4FB8E8]/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-lg font-bold text-white">{room.name}</p>
                    {room.isFree ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#3DDC84]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3DDC84]">
                        <CheckCircle2 className="h-3 w-3" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-[#F5A623]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">
                        In Use
                      </span>
                    )}
                  </div>

                  {!room.isFree && room.lecturer ? (
                    <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-[#7F93B3]">
                        <UserCheck className="h-4 w-4" /> 
                        <span><span className="text-white/80">Occupied by:</span> {room.lecturer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#F5A623] font-medium">
                        <Clock className="h-4 w-4 animate-pulse" /> 
                        Ends in {currentEndsIn} mins
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-[#7F93B3]">Ready for immediate session start.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}