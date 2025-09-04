import React, { useState, useEffect } from 'react';
import ChartDownloadWrapper from '../components/reusable/chartDownloader';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';
import { Download, Filter, Printer, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const [rawData, setRawData] = useState({
    players: [],
    clubs: [],
    federations: [],
    transfers: [],
    students: [],
    institutions: [],
    infrastructures: [],
    infraCategories: []
  });

  const [filters, setFilters] = useState({
    federation: '',
    discipline: '',
    year: new Date().getFullYear(),
    month: '',
    gender: '',
    search: '',
    ageRange: '',
    nationality: '',
    status: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    federations: [],
    disciplines: [],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    years: Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()),
    genders: ['MALE', 'FEMALE'],
    nationalities: []
  });

  const [statsData, setStatsData] = useState({
    playerDistribution: [],
    genderDistribution: [],
    clubPerformance: [],
    facilityUsage: [],
    competitionResults: [],
    federationActivity: [],
    monthlyRegistrations: [],
    disciplineGender: [],
    ageGroups: []
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('By Discipline & Gender');
  const [topTab, setTopTab] = useState('Sports professionals Report');

  // Isonga & Infrastructure tab-specific state
  const [isongaTab, setIsongaTab] = useState('Students by Game & Gender');
  const [infraTab, setInfraTab] = useState('By Province');
  const [isongaFilters, setIsongaFilters] = useState({ province: '', district: '', sector: '', cell: '', village: '', school: '' });
  const [infraFilters, setInfraFilters] = useState({ province: '', district: '', sector: '', cell: '', village: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    processData();
  }, [filters, rawData]);

  const getAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  };

  const fetchInitialData = async () => {
    try {
      const [players, clubs, federations, transfers, students, institutions, infrastructures, infraCategories] = await Promise.all([
        axiosInstance.get('/player-staff'),
        axiosInstance.get('/clubs'),
        axiosInstance.get('/federations'),
        axiosInstance.get('/transfers'),
        axiosInstance.get('/students'),
        axiosInstance.get('/institutions'),
        axiosInstance.get('/infrastructures'),
        axiosInstance.get('/infrastructure-categories')
      ]);

      setRawData({
        players: players.data,
        clubs: clubs.data,
        federations: federations.data,
        transfers: transfers.data,
        students: students.data?.data || students.data || [],
        institutions: institutions.data || [],
        infrastructures: infrastructures.data || [],
        infraCategories: infraCategories.data || []
      });

      const disciplines = [...new Set(players.data.map(p => p.discipline))].filter(Boolean);
      const nationalities = [...new Set(players.data.map(p => p.nationality))].filter(Boolean);

      setFilterOptions(prev => ({
        ...prev,
        federations: federations.data.map(f => ({ value: f.id, label: f.name })),
        disciplines: disciplines.map(d => ({ value: d, label: d })),
        nationalities
      }));

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const processData = () => {
    if (!rawData.players.length) return;

    const filteredPlayers = rawData.players.filter(player => {
      const matchesFederation = !filters.federation || player.federationId === filters.federation;
      const matchesDiscipline = !filters.discipline || player.discipline === filters.discipline;
      const matchesGender = !filters.gender || player.gender === filters.gender;
      const matchesSearch = !filters.search || `${player.firstName} ${player.lastName}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesNationality = !filters.nationality || player.nationality === filters.nationality;

      const age = getAge(player.dateOfBirth);
      let matchesAge = true;
      if (filters.ageRange) {
        if (filters.ageRange === '60+') matchesAge = age != null && age >= 60;
        else {
          const [minA, maxA] = filters.ageRange.split('-').map(n => parseInt(n, 10));
          matchesAge = age != null && age >= minA && age <= maxA;
        }
      }

      // Region parses
      const parts = (player.placeOfResidence || '').split(',').map(s => s.trim());
      const [district, sector, cell, village] = parts;
      const matchesRegion = (!filters.province || player.region === filters.province)
        && (!filters.district || district === filters.district)
        && (!filters.sector || sector === filters.sector)
        && (!filters.cell || cell === filters.cell)
        && (!filters.village || village === filters.village);

      return matchesFederation && matchesDiscipline && matchesGender && matchesSearch && matchesNationality && matchesAge && matchesRegion;
    });

    setStatsData({
      playerDistribution: processPlayerDistribution(filteredPlayers),
      genderDistribution: processGenderDistribution(filteredPlayers),
      clubPerformance: processClubPerformance(rawData.clubs, filteredPlayers),
      facilityUsage: [
        { month: 'Jan', usage: 65 },
        { month: 'Feb', usage: 75 },
        { month: 'Mar', usage: 85 },
        { month: 'Apr', usage: 70 },
        { month: 'May', usage: 90 }
      ],
      federationActivity: processFederationActivity(rawData.federations, filteredPlayers, rawData.clubs),
      monthlyRegistrations: processMonthlyRegistrations(filteredPlayers),
      competitionResults: rawData.federations.map(federation => ({
        name: federation.name,
        events: federation.events?.length || 0,
        participants: federation.participants?.length || 0
      })),
      disciplineGender: processDisciplineGender(filteredPlayers),
      ageGroups: processAgeGroups(filteredPlayers)
    });
  };

  // Helpers to filter students/infrastructures for secondary tabs
  const filterStudentsByLocation = (students) => {
    return (students || []).filter(s => {
      const parts = (s.placeOfResidence || '').split(',').map(p => p.trim());
      const [district, sector, cell, village] = parts;
      const province = s.province || s.region; // sometimes stored as province/region
      const schoolMatch = !isongaFilters.school || s.institution?.name === isongaFilters.school || s.nameOfSchoolAcademyTrainingCenter === isongaFilters.school;
      return (!isongaFilters.province || province === isongaFilters.province)
        && (!isongaFilters.district || district === isongaFilters.district)
        && (!isongaFilters.sector || sector === isongaFilters.sector)
        && (!isongaFilters.cell || cell === isongaFilters.cell)
        && (!isongaFilters.village || village === isongaFilters.village)
        && schoolMatch;
    });
  };

  const filterInfrasByLocation = (infras) => {
    return (infras || []).filter(i => {
      return (!infraFilters.province || (i.location_province || i.province) === infraFilters.province)
        && (!infraFilters.district || (i.location_district || i.district) === infraFilters.district)
        && (!infraFilters.sector || (i.location_sector || i.sector) === infraFilters.sector)
        && (!infraFilters.cell || (i.location_cell || i.cell) === infraFilters.cell)
        && (!infraFilters.village || (i.location_village || i.village) === infraFilters.village);
    });
  };

  // Data processing functions
  const processPlayerDistribution = (players) => {
    const distribution = players.reduce((acc, player) => {
      if (player.type === 'PLAYER') {
        const discipline = player.discipline || 'Unspecified';
        acc[discipline] = (acc[discipline] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  const processGenderDistribution = (players) => {
    const genderCount = players.reduce((acc, player) => {
      const gender = player.gender || 'UNKNOWN';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(genderCount).reduce((a, b) => a + b, 0);

    return Object.entries(genderCount).map(([name, value]) => ({
      name,
      value,
      percentage: total ? ((value / total) * 100).toFixed(1) : 0
    }));
  };

  const processClubPerformance = (clubs, players) => {
    return clubs.map(club => ({
      name: club.name,
      players: players.filter(p => p.clubId === club.id).length,
      staff: club.staff?.length || 0,
      teams: club.teams?.length || 0
    })).slice(0, 10);
  };

  const processFederationActivity = (federations, players, clubs) => {
    return federations.map(federation => {
      const federationPlayers = players.filter(p =>
          p.type === 'PLAYER' && p.federationId === federation.id
      );
      const federationClubs = clubs.filter(c => c.federationId === federation.id);

      return {
        name: federation.name || federation.acronym,
        players: federationPlayers.length,
        clubs: federationClubs.length,
      };
    });
  };

  const processMonthlyRegistrations = (players) => {
    const monthlyData = players.reduce((acc, player) => {
      if (player.type === 'PLAYER' && player.joinDate) {
        const date = new Date(player.joinDate);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(monthlyData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  };

  const processDisciplineGender = (players) => {
    const map = {};
    players.forEach(p => {
      const d = p.discipline || 'Unspecified';
      map[d] = map[d] || { discipline: d, MALE: 0, FEMALE: 0 };
      map[d][p.gender || 'UNKNOWN'] = (map[d][p.gender || 'UNKNOWN'] || 0) + 1;
    });
    return Object.values(map);
  };

  const processAgeGroups = (players) => {
    const ranges = [
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-45', min: 36, max: 45 },
      { label: '46-60', min: 46, max: 60 },
      { label: '60+', min: 61, max: 200 }
    ];
    const counts = ranges.reduce((acc, r) => ({ ...acc, [r.label]: 0 }), {});
    players.forEach(p => {
      const a = getAge(p.dateOfBirth);
      ranges.forEach(r => {
        if (a != null && a >= r.min && a <= (r.max || a)) counts[r.label] += 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="p-6">Loading...</div>
    );
  }

  const totalPlayers = (statsData.genderDistribution || []).reduce((s, x) => s + (x.value || 0), 0);
  const totalStudents = Array.isArray(rawData.students) ? rawData.students.length : 0;
  const totalInfras = Array.isArray(rawData.infrastructures) ? rawData.infrastructures.length : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Top-level tabs */}
      <div className="flex items-center gap-3 text-sm">
        {['Sports professionals Report', 'Isonga program report', 'Sports infrastructure report'].map((t, idx) => (
          <React.Fragment key={t}>
            <button
              className={`px-2 py-1 ${topTab === t ? 'text-blue-700 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setTopTab(t)}
            >
              {t}
            </button>
            {idx < 2 && <span className="text-gray-300">|</span>}
          </React.Fragment>
        ))}
      </div>

      <h1 className="text-2xl font-bold">{topTab}</h1>

      {/* Only show filters for Sports professionals report for now */}
      {topTab === 'Sports professionals Report' && (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3">Search By</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Federation</label>
            <select className="w-full border rounded px-2 py-1" value={filters.federation} onChange={(e) => setFilters(prev => ({ ...prev, federation: Number(e.target.value) || '' }))}>
              <option value="">Select Federation</option>
              {filterOptions.federations.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Discipline</label>
            <select className="w-full border rounded px-2 py-1" value={filters.discipline} onChange={(e) => setFilters(prev => ({ ...prev, discipline: e.target.value }))}>
              <option value="">Select Discipline</option>
              {filterOptions.disciplines.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Age</label>
            <select className="w-full border rounded px-2 py-1" value={filters.ageRange} onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}>
              <option value="">Select Age</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46-60">46-60</option>
              <option value="60+">60+</option>
            </select>
        </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sex</label>
            <select className="w-full border rounded px-2 py-1" value={filters.gender} onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}>
              <option value="">Select Sex</option>
              {filterOptions.genders.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nationality</label>
            <select className="w-full border rounded px-2 py-1" value={filters.nationality} onChange={(e) => setFilters(prev => ({ ...prev, nationality: e.target.value }))}>
              <option value="">Select</option>
              {filterOptions.nationalities.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Search</label>
            <input className="w-full border rounded px-2 py-1" placeholder="Search..." value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
          </div>
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Province</label>
            <input className="w-full border rounded px-2 py-1" value={filters.province} onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))} placeholder="Select Province" />
            </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">District</label>
            <input className="w-full border rounded px-2 py-1" value={filters.district} onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))} placeholder="Select District" />
            </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sector</label>
            <input className="w-full border rounded px-2 py-1" value={filters.sector} onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))} placeholder="Select Sector" />
            </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Cell</label>
            <input className="w-full border rounded px-2 py-1" value={filters.cell} onChange={(e) => setFilters(prev => ({ ...prev, cell: e.target.value }))} placeholder="Select Cell" />
            </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Village</label>
            <input className="w-full border rounded px-2 py-1" value={filters.village} onChange={(e) => setFilters(prev => ({ ...prev, village: e.target.value }))} placeholder="Select Village" />
          </div>
        </div>
      </div>
      )}

      {/* Content with left tabs */}
      {topTab === 'Sports professionals Report' && (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-3 border-r p-4">
            <div className="space-y-2 text-sm">
              {['By Discipline & Gender', 'By Gender', 'By Age group', 'By Discipline'].map(tab => (
                <button
                  key={tab}
                  className={`block text-left w-full ${activeTab === tab ? 'text-green-700 font-semibold' : 'text-blue-700'} hover:underline`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-9 p-4">
            {activeTab === 'By Discipline & Gender' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Sports professionals by Discipline and Gender (Total {totalPlayers})</h3>
                <div style={{ width: '100%', height: 380 }}>
                  <ResponsiveContainer>
                    <BarChart data={statsData.disciplineGender} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="discipline" />
                      <YAxis />
                  <Tooltip />
                  <Legend />
                      <Bar dataKey="MALE" fill="#4F46E5" name="Male" />
                      <Bar dataKey="FEMALE" fill="#EC4899" name="Female" />
                    </BarChart>
              </ResponsiveContainer>
                </div>
          </div>
            )}

            {activeTab === 'By Gender' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Gender Distribution (Total {totalPlayers})</h3>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                <PieChart>
                      <Pie data={statsData.genderDistribution} dataKey="value" nameKey="name" outerRadius={120} label>
                    {statsData.genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
                </div>
          </div>
            )}

            {activeTab === 'By Age group' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">By Age group</h3>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={statsData.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                      <Bar dataKey="value" name="Count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
                </div>
          </div>
            )}

            {activeTab === 'By Discipline' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">By Discipline</h3>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={statsData.playerDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                      <Bar dataKey="value" name="Players" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {topTab === 'Isonga program report' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-3">Filter By</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {['province','district','sector','cell','village'].map((key)=> (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{key.charAt(0).toUpperCase()+key.slice(1)}</label>
                  <input className="w-full border rounded px-2 py-1" value={isongaFilters[key]} onChange={(e)=>setIsongaFilters(prev=>({...prev,[key]:e.target.value}))} placeholder={`Select ${key}`} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-600 mb-1">School</label>
                <input className="w-full border rounded px-2 py-1" value={isongaFilters.school} onChange={(e)=>setIsongaFilters(prev=>({...prev,school:e.target.value}))} placeholder="Select school" />
              </div>
            </div>
          </div>

          {/* Left tabs and chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-3 border-r p-4">
                <div className="space-y-2 text-sm">
                  {['Students by Game & Gender','Students by Game','Students by Center','Centers by district','Students by district','Students by age group'].map(t => (
                    <button key={t} className={`block text-left w-full ${isongaTab===t?'text-green-700 font-semibold':'text-blue-700'} hover:underline`} onClick={()=>setIsongaTab(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 p-4">
                {(() => {
                  const students = filterStudentsByLocation(rawData.students);
                  if (isongaTab === 'Students by Game & Gender') {
                    const genders=['MALE','FEMALE'];
                    const games = Array.from(new Set(students.map(s=>s.typeOfGame||'N/A')));
                    const series = genders.reduce((acc,g)=>{
                      acc[g] = games.map(game => students.filter(s=> (s.typeOfGame||'N/A')===game && s.gender===g).length);
                      return acc;
                    }, {});
                    const data = games.map((game,idx)=>({ game, MALE: series.MALE[idx], FEMALE: series.FEMALE[idx] }));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Isonga Program - Students by Game (Total {students.length})</h3>
                        <div style={{ width:'100%', height:360 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="game" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="MALE" name="Male" fill="#3B82F6" />
                              <Bar dataKey="FEMALE" name="Female" fill="#EC4899" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (isongaTab === 'Students by Game') {
                    const map={}; students.forEach(s=>{ const k=s.typeOfGame||'N/A'; map[k]=(map[k]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Students by Game</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#10B981" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (isongaTab === 'Students by Center') {
                    const map={}; students.forEach(s=>{ const k=s.institution?.name || s.nameOfSchoolAcademyTrainingCenter || 'N/A'; map[k]=(map[k]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Students by Center</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#6366F1" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (isongaTab === 'Centers by district') {
                    const map={}; (rawData.institutions||[]).forEach(i=>{ const k=i.location_district||'N/A'; map[k]=(map[k]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Centers by District</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#8B5CF6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (isongaTab === 'Students by district') {
                    const map={}; students.forEach(s=>{ const parts=(s.placeOfResidence||'').split(',').map(t=>t.trim()); const d=parts[0]||'N/A'; map[d]=(map[d]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Students by District</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#F59E0B" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  // Students by age group
                  const ranges=[{label:'10-13',min:10,max:13},{label:'14-17',min:14,max:17},{label:'18+',min:18,max:80}];
                  const counts=ranges.reduce((a,r)=>({...a,[r.label]:0}),{});
                  students.forEach(s=>{ const a=getAge(s.dateOfBirth); ranges.forEach(r=>{ if(a!=null&&a>=r.min&&a<=r.max) counts[r.label]+=1; }); });
                  const data=Object.entries(counts).map(([name,value])=>({name,value}));
                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Students by Age group</h3>
                      <div style={{ width:'100%', height:320 }}>
                        <ResponsiveContainer>
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      {topTab === 'Sports infrastructure report' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-3">Search By</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {['province','district','sector','cell','village'].map((key)=> (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{key.charAt(0).toUpperCase()+key.slice(1)}</label>
                  <input className="w-full border rounded px-2 py-1" value={infraFilters[key]} onChange={(e)=>setInfraFilters(prev=>({...prev,[key]:e.target.value}))} placeholder={`Select ${key}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-3 border-r p-4">
                <div className="space-y-2 text-sm">
                  {['By Province','By District','By Sports'].map(t => (
                    <button key={t} className={`block text-left w-full ${infraTab===t?'text-green-700 font-semibold':'text-blue-700'} hover:underline`} onClick={()=>setInfraTab(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 p-4">
                {(() => {
                  const infras = filterInfrasByLocation(rawData.infrastructures);
                  if (infraTab === 'By Province') {
                    const map={}; infras.forEach(i=>{ const k=i.location_province||i.province||'Unknown'; map[k]=(map[k]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Sports infrastructure by province ({data.reduce((s,x)=>s+x.value,0)})</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#7C3AED" name="Values" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  if (infraTab === 'By District') {
                    const map={}; infras.forEach(i=>{ const k=i.location_district||i.district||'Unknown'; map[k]=(map[k]||0)+1; });
                    const data=Object.entries(map).map(([name,value])=>({name,value}));
                    return (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Sports infrastructure by district</h3>
                        <div style={{ width:'100%', height:320 }}>
                          <ResponsiveContainer>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  }
                  const map={}; infras.forEach(i=>{ const k=(i.types_of_sports||'').toString()||'N/A'; map[k]=(map[k]||0)+1; });
                  const data=Object.entries(map).map(([name,value])=>({name,value}));
                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sports infrastructure by sports</h3>
                      <div style={{ width:'100%', height:320 }}>
                        <ResponsiveContainer>
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70}/>
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#22C55E" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

export default Reports;