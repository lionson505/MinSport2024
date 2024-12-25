import { ChevronRight } from 'lucide-react';

function LeaguesToBrowse() {
  const leagues = [
    { 
      id: 'rpl', 
      name: 'RPL', 
      logo: '/leagues/rpl.png', 
      bgColor: 'bg-[#1B2559]',
      gradient: 'bg-gradient-to-br from-[#1B2559] to-[#2B3674]'
    },
    { 
      id: 'rbl', 
      name: 'RBL', 
      logo: '/leagues/rbl.png', 
      bgColor: 'bg-[#0099FF]',
      gradient: 'bg-gradient-to-br from-[#0099FF] to-[#33B1FF]'
    },
    { 
      id: 'frvb', 
      name: 'FRVB', 
      logo: '/leagues/frvb.png', 
      bgColor: 'bg-[#4318FF]',
      gradient: 'bg-gradient-to-br from-[#4318FF] to-[#6B4DFF]'
    },
    { 
      id: 'trdr', 
      name: 'TRDR', 
      logo: '/leagues/trdr.png', 
      bgColor: 'bg-white',
      shadow: true
    },
    { 
      id: 'bal', 
      name: 'BAL', 
      logo: '/leagues/bal.png', 
      bgColor: 'bg-[#05CD99]',
      gradient: 'bg-gradient-to-br from-[#05CD99] to-[#33D9B2]'
    },
    { 
      id: 'npc', 
      name: 'NPC', 
      logo: '/leagues/npc.png', 
      bgColor: 'bg-[#FFB547]',
      gradient: 'bg-gradient-to-br from-[#FFB547] to-[#FFC773]'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1B2559]">Leagues To Browse</h2>
        <button className="text-[#4318FF] flex items-center text-sm font-medium">
        view all <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {leagues.map((league) => (
          <div
            key={league.id}
            className={`h-[120px] rounded-[20px] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
              league.gradient || league.bgColor
            } ${league.shadow ? 'shadow-sm' : ''}`}
          >
            <img
              src={league.logo}
              alt={league.name}
              className="w-16 h-16 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaguesToBrowse; 