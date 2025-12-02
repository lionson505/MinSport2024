import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TablePagination } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { locations } from '../data/locations';
import { playersApi } from '../lib/api';
import axiosInstance from '../utils/axiosInstance';

// Placeholder data loader: in real app, fetch players by tournamentId
const mockPlayers = (tournamentId) => {
  return [
    { id: 1, name: 'John Doe', nationalId: '1199**********12', university: 'UR', sector: 'Kigali', sport: 'Football', status: 'approved' },
    { id: 2, name: 'Jane Smith', nationalId: '1188**********34', university: 'INES', sector: 'Gasabo', sport: 'Basketball', status: 'pending' },
  ];
};

const statusColor = (s) => s === 'approved' ? 'bg-green-500' : s === 'pending' ? 'bg-yellow-500' : 'bg-gray-500';

export default function TournamentPlayers() {
  const { id } = useParams();
  const location = useLocation();
  const tournament = location.state?.tournament || { id, name: 'Tournament', type: 'inter_universities', season: '' };

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, player: null, submitting: false });
  const pageSize = 10;

  // Load players from API (defined after state is initialized)
  const loadPlayers = useCallback(async () => {
    try {
      const list = await playersApi.list(tournament.id);
      setPlayers(list || []);
    } catch (e) {
      console.error('Failed to load players', e);
    }
  }, [tournament.id]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Player registration form state and helpers
  const genderOptions = ['Male', 'Female', 'Other'];
  const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const idTypes = ['National ID', 'Passport'];
  const fitnessOptions = ['Fit', 'Injured', 'Recovering'];
  const educationOptions = ['Primary', 'Secondary', 'Diploma', 'Bachelor', 'Master', 'PhD'];

  const [playerForm, setPlayerForm] = useState({
    idType: '',
    nationalId: '',
    passportNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    placeOfResidence: '',
    discipline: '',
    nationality: '',
    
    joinDate: '',
    placeOfBirth: '',
    fitnessStatus: '',
    passportPhotoUrl: '',
  });

  // Cascaded location selectors for Place of Residence
  const [resGeo, setResGeo] = useState({ province: '', district: '', sector: '' });

  // NIDA demo lookup state
  const [nidaState, setNidaState] = useState({ loading: false, error: '', verified: false });

  // Upload passport photo -> backend /api/uploads/passport
  const handlePassportUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/passport`, { method: 'POST', body: fd, credentials: 'include' });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Upload failed');
      const url = json?.data?.url;
      if (url) setPlayerForm((p) => ({ ...p, passportPhotoUrl: url }));
    } catch (err) {
      console.error('Passport upload failed:', err);
    }
  };

  const handleNidaCheck = async () => {
    // Validate: National ID must be 16 digits
    if (!playerForm.nationalId || !/^\d{16}$/.test(playerForm.nationalId)) {
      setNidaState({ loading: false, error: 'National ID must be exactly 16 digits.', verified: false });
      return;
    }
    setNidaState({ loading: true, error: '', verified: false });
    try {
      const idNumber = playerForm.nationalId;
      const response = await axiosInstance.get(`/player-staff/citizen/${idNumber}`);

      const statusCode = response?.data?.status_code ?? response?.status;
      const details = response?.data?.details;

      if (statusCode === 200 && details) {
        const toTitle = (s) => (typeof s === 'string' && s.length ? s.charAt(0) + s.slice(1).toLowerCase() : '');
        const genderMap = (g) => {
          const v = (g || '').toString().toUpperCase();
          if (v === 'MALE' || v === 'M') return 'Male';
          if (v === 'FEMALE' || v === 'F') return 'Female';
          return '';
        };

        setPlayerForm((p) => ({
          ...p,
          firstName: details.first_name || p.firstName,
          lastName: details.last_name || p.lastName,
          dateOfBirth: details.dob || p.dateOfBirth,
          gender: genderMap(details.gender) || p.gender,
          placeOfBirth: details.placeOfBirth || p.placeOfBirth,
          nationality: details.nationality || p.nationality,
          maritalStatus: toTitle(details.marital_status) || p.maritalStatus,
        }));
        setNidaState({ loading: false, error: '', verified: true });
      } else {
        const message = response?.data?.message || (statusCode === 404 ? 'ID not found' : 'Failed to verify ID');
        setNidaState({ loading: false, error: message, verified: false });
      }
    } catch (e) {
      const status = e.response?.status || e.response?.data?.status_code;
      const message = e.response?.data?.message || (status === 404 ? 'ID not found' : (e.message || 'NIDA lookup failed'));
      setNidaState({ loading: false, error: message, verified: false });
    }
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm((p) => ({ ...p, [name]: value }));
  };
  const onFormSelect = (name) => (val) => setPlayerForm((p) => ({ ...p, [name]: val }));
  const onFormFile = (name) => (e) => setPlayerForm((p) => ({ ...p, [name]: e.target.files?.[0] || null }));
  const onFormSubmit = async (e) => {
    e.preventDefault();
    // TODO: integrate API
    if (editingPlayer) {
      // Update existing with minimal meaningful fields to avoid overwriting with empty values
      const raw = {
        idType: playerForm.idType,
        nationalId: playerForm.nationalId,
        passportNumber: playerForm.passportNumber,
        firstName: playerForm.firstName,
        lastName: playerForm.lastName,
        dateOfBirth: playerForm.dateOfBirth,
        gender: playerForm.gender,
        maritalStatus: playerForm.maritalStatus,
        placeOfResidence: playerForm.placeOfResidence,
        resProvince: resGeo.province,
        resDistrict: resGeo.district,
        resSector: resGeo.sector,
        placeOfBirth: playerForm.placeOfBirth,
        nationality: playerForm.nationality,
        discipline: tournament.type === 'umurenge_kagame' ? 'Football' : playerForm.discipline,
        fitnessStatus: playerForm.fitnessStatus,
        passportPhotoUrl: playerForm.passportPhotoUrl,
        joinDate: playerForm.joinDate,
        status: 'pending',
      };
      // Remove empty string/null/undefined
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([k, v]) => v !== undefined && v !== null && v !== '')
      );
      // If id fields are empty, ensure we don't send them
      if (!playerForm.idType) delete payload.idType;
      if (!playerForm.nationalId) delete payload.nationalId;
      if (!playerForm.passportNumber) delete payload.passportNumber;

      await playersApi.update(editingPlayer.id, payload);
      await loadPlayers();
    } else {
      await playersApi.create(tournament.id, {
        idType: playerForm.idType,
        nationalId: playerForm.nationalId,
        passportNumber: playerForm.passportNumber,
        firstName: playerForm.firstName,
        lastName: playerForm.lastName,
        dateOfBirth: playerForm.dateOfBirth,
        gender: playerForm.gender,
        maritalStatus: playerForm.maritalStatus,
        placeOfResidence: playerForm.placeOfResidence,
        resProvince: resGeo.province,
        resDistrict: resGeo.district,
        resSector: resGeo.sector,
        placeOfBirth: playerForm.placeOfBirth,
        nationality: playerForm.nationality,
        discipline: tournament.type === 'umurenge_kagame' ? 'Football' : playerForm.discipline,
        fitnessStatus: playerForm.fitnessStatus,
        passportPhotoUrl: playerForm.passportPhotoUrl,
        joinDate: playerForm.joinDate,
        status: 'pending',
      });
      await loadPlayers();
    }
    setIsRegOpen(false);
    setEditingPlayer(null);
    // minimal reset
    setPlayerForm((p) => ({ ...p, firstName: '', lastName: '', passportNumber: '', nationalId: '' }));
  };

  const filtered = useMemo(() => players.filter(p => `${p.name} ${p.nationalId} ${p.university} ${p.sector}`.toLowerCase().includes(search.toLowerCase())), [players, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, (safePage - 1) * pageSize + pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/tournaments">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
          </Link>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5"/> Players - {tournament.name}</h1>
          <Badge variant="secondary">{tournament.type === 'umurenge_kagame' ? 'Umurenge Kagame Cup' : 'Inter-universities'}</Badge>
          {tournament.season && (<Badge variant="outline">{tournament.season}</Badge>)}
        </div>
        <Button onClick={() => { setEditingPlayer(null); setIsRegOpen(true); }}><Plus className="w-4 h-4 mr-1"/>Add Player</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players by name, ID, university/sector..." className="pl-9 w-80"/>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>National/Passport</TableHead>
                <TableHead>University/Sector</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell>{(safePage - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell className="font-medium">{p.fullName || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || '-'}</TableCell>
                  <TableCell>{p.nationalId || '-'}</TableCell>
                  <TableCell>{p.resSector || p.placeOfResidence || p.university || p.sector || '-'}</TableCell>
                  <TableCell>{tournament.type === 'umurenge_kagame' ? 'Football' : (p.discipline || p.sport || '-')}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-white text-xs ${statusColor(p.status)}`}>{p.status}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const full = await playersApi.get(p.id);
                            setViewing(full || p);
                          } catch (e) {
                            console.error('Failed to fetch player details', e);
                            setViewing(p);
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1"/>View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          // Get freshest record for editing
                          let rec = p;
                          try {
                            const full = await playersApi.get(p.id);
                            if (full) rec = full;
                          } catch {}

                          setEditingPlayer(rec);

                          const fullName = rec.fullName || [rec.firstName, rec.lastName].filter(Boolean).join(' ') || rec.name || '';
                          const [firstName = '', ...rest] = fullName.split(' ');
                          const lastName = rest.join(' ');

                          const idType = rec.idType === 'PASSPORT' ? 'Passport' : 'National ID';
                          const gender = rec.gender === 'MALE' ? 'Male' : rec.gender === 'FEMALE' ? 'Female' : '';
                          const marital = rec.maritalStatus
                            ? rec.maritalStatus.charAt(0) + rec.maritalStatus.slice(1).toLowerCase()
                            : '';
                          const fitness = rec.fitnessStatus === 'FIT' ? 'Fit' : (rec.fitnessStatus ? 'Injured' : '');

                          const dateOfBirth = rec.dateOfBirth ? String(rec.dateOfBirth).slice(0, 10) : '';
                          const joinDate = rec.joinDate ? String(rec.joinDate).slice(0, 10) : '';

                          const province = rec.resProvince || '';
                          const district = rec.resDistrict || '';
                          const sector = rec.resSector || '';
                          const residence = province
                            ? [province, district, sector].filter(Boolean).join(' / ')
                            : (rec.placeOfResidence || '');

                          setResGeo({ province, district, sector });

                          setPlayerForm((f) => ({
                            ...f,
                            idType,
                            nationalId: rec.nationalId || '',
                            passportNumber: rec.passportNumber || '',
                            firstName,
                            lastName,
                            dateOfBirth,
                            gender,
                            maritalStatus: marital,
                            placeOfResidence: residence,
                            discipline: tournament.type === 'umurenge_kagame' ? 'Football' : (rec.discipline || rec.sport || ''),
                            nationality: rec.nationality || '',
                            joinDate,
                            placeOfBirth: rec.placeOfBirth || '',
                            fitnessStatus: fitness,
                            passportPhotoUrl: rec.passportPhotoUrl || f.passportPhotoUrl || '',
                          }));
                          setIsRegOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1"/>Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setConfirmDelete({ open: true, player: p, submitting: false })}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {slice.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-600">No players found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage}/>
        </CardContent>
      </Card>

      {/* Inline Player Registration Modal */}
      <Dialog open={isRegOpen} onOpenChange={(open) => { if (open === false) return; }}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto" disableOutsideClose={true} hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add Player'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">ID Type</Label>
                <Select value={playerForm.idType} onValueChange={onFormSelect('idType')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {idTypes.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              {playerForm.idType === 'National ID' ? (
                <div>
                  <Label className="mb-1 block">National ID</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      name="nationalId"
                      value={playerForm.nationalId}
                      onChange={onFormChange}
                      placeholder="e.g. 1199************"
                      className="flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNidaCheck(); } }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0"
                      onClick={handleNidaCheck}
                      disabled={nidaState.loading || !playerForm.nationalId}
                    >
                      {nidaState.loading ? 'Checking…' : 'Check NIDA'}
                    </Button>
                    {nidaState.verified && (
                      <Badge variant="secondary" className="shrink-0">Verified</Badge>
                    )}
                  </div>
                  {nidaState.error && (<div className="text-sm text-red-600 mt-1">{nidaState.error}</div>)}
                </div>
              ) : (
                <div>
                  <Label className="mb-1 block">Passport Number</Label>
                  <Input name="passportNumber" value={playerForm.passportNumber} onChange={onFormChange} placeholder="e.g. PC1234567" />
                </div>
              )}
              <div>
                <Label className="mb-1 block">Gender</Label>
                <Select value={playerForm.gender} onValueChange={onFormSelect('gender')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">First Name</Label>
                <Input name="firstName" value={playerForm.firstName} onChange={onFormChange} required />
              </div>
              <div>
                <Label className="mb-1 block">Last Name</Label>
                <Input name="lastName" value={playerForm.lastName} onChange={onFormChange} required />
              </div>
              <div>
                <Label className="mb-1 block">Date of Birth</Label>
                <Input type="date" name="dateOfBirth" value={playerForm.dateOfBirth} onChange={onFormChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">Marital Status</Label>
                <Select value={playerForm.maritalStatus} onValueChange={onFormSelect('maritalStatus')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Place of Residence</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Select value={resGeo.province} onValueChange={(v) => {
                      setResGeo({ province: v, district: '', sector: '' });
                      setPlayerForm((p) => ({ ...p, placeOfResidence: v }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Province" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.provinces.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      </SelectContent>
                    </Select>

                    <Select value={resGeo.district} onValueChange={(v) => {
                      const loc = `${resGeo.province} / ${v}`;
                      setResGeo((g) => ({ ...g, district: v, sector: '' }));
                      setPlayerForm((p) => ({ ...p, placeOfResidence: loc }));
                    }} disabled={!resGeo.province}>
                      <SelectTrigger>
                        <SelectValue placeholder="District" />
                      </SelectTrigger>
                      <SelectContent>
                        {(locations.districts[resGeo.province] || []).map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                      </SelectContent>
                    </Select>

                    <Select value={resGeo.sector} onValueChange={(v) => {
                      const loc = `${resGeo.province} / ${resGeo.district} / ${v}`;
                      setResGeo((g) => ({ ...g, sector: v }));
                      setPlayerForm((p) => ({ ...p, placeOfResidence: loc }));
                    }} disabled={!resGeo.district}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sector (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(locations.sectors[resGeo.district] || []).map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input name="placeOfResidence" value={playerForm.placeOfResidence} onChange={onFormChange} placeholder="Province / District / Sector" disabled />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Place of Birth</Label>
                <Input name="placeOfBirth" value={playerForm.placeOfBirth} onChange={onFormChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">Discipline</Label>
                <Input name="discipline" value={playerForm.discipline} onChange={onFormChange} placeholder="e.g. Football" />
              </div>
              <div>
                <Label className="mb-1 block">Nationality</Label>
                <Input name="nationality" value={playerForm.nationality} onChange={onFormChange} />
              </div>
              {/* Removed: Other Nationality */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {/* Removed: Position in Club */}
              </div>
              <div>
                {/* Removed: Federation */}
              </div>
              <div>
                {/* Removed: Current Club */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {/* Removed: Origin Club */}
              </div>
              <div>
                <Label className="mb-1 block">Join Date</Label>
                <Input type="date" name="joinDate" value={playerForm.joinDate} onChange={onFormChange} />
              </div>
              <div>
                <Label className="mb-1 block">Fitness Status</Label>
                <Select value={playerForm.fitnessStatus} onValueChange={onFormSelect('fitnessStatus')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fitness" />
                  </SelectTrigger>
                  <SelectContent>
                    {fitnessOptions.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {/* Removed: Level of Education */}
              </div>
              <div>
                {/* Removed: Photo */}
              </div>
              <div>
                <Label className="mb-1 block">Upload passport photo</Label>
                <Input type="file" accept="image/*" onChange={handlePassportUpload} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsRegOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Player dialog (read-only, mirrors form sections) */}
      <Dialog open={!!viewing} onOpenChange={(open) => { if (open === false) return; }}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto" disableOutsideClose={true} hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle>View Player</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">ID Type</div>
                  <div className="font-medium">{viewing.idType || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">National/Passport</div>
                  <div className="font-medium">{viewing.nationalId || viewing.passportNumber || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gender</div>
                  <div className="font-medium">{viewing.gender || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="text-xs text-gray-500">Passport Photo</div>
                  {viewing.passportPhotoUrl ? (
                    (() => {
                      const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                      const p = viewing.passportPhotoUrl || '';
                      const src = p.startsWith('http') ? p : `${API}${p.replace(/^\/api/, '')}`;
                      return (
                        <img
                          src={src}
                          alt="Passport"
                          className="mt-1 h-40 w-32 object-cover rounded border"
                        />
                      );
                    })()
                  ) : (
                    <div className="font-medium">-</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">First Name</div>
                  <div className="font-medium">{viewing.firstName || (viewing.fullName ? viewing.fullName.split(' ')[0] : undefined) || viewing.name?.split(' ')[0] || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Name</div>
                  <div className="font-medium">{viewing.lastName || (viewing.fullName ? viewing.fullName.split(' ').slice(1).join(' ') : undefined) || viewing.name?.split(' ').slice(1).join(' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="font-medium">{viewing.dateOfBirth || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Marital Status</div>
                  <div className="font-medium">{viewing.maritalStatus || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Place of Residence</div>
                  <div className="font-medium">{[viewing.resProvince, viewing.resDistrict, viewing.resSector].filter(Boolean).join(' / ') || viewing.placeOfResidence || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Place of Birth</div>
                  <div className="font-medium">{viewing.placeOfBirth || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Discipline</div>
                  <div className="font-medium">{tournament.type === 'umurenge_kagame' ? 'Football' : (viewing.discipline || viewing.sport || '-')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nationality</div>
                  <div className="font-medium">{viewing.nationality || '-'}</div>
                </div>
              </div>

              {/* Removed: Position in Club, Federation, Current Club */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Join Date</div>
                  <div className="font-medium">{viewing.joinDate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fitness Status</div>
                  <div className="font-medium">{(viewing.fitnessStatus === 'FIT' && 'Fit') || (viewing.fitnessStatus === 'UNFIT' && 'Unfit') || viewing.fitnessStatus || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium"><span className={`px-2 py-1 rounded text-white text-xs ${statusColor(viewing.status || 'pending')}`}>{viewing.status || 'pending'}</span></div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button onClick={() => setViewing(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, player: null, submitting: false })}
        onConfirm={async () => {
          setConfirmDelete((s) => ({ ...s, submitting: true }));
          // Simulate delete
          await new Promise(r => setTimeout(r, 400));
          setPlayers(prev => prev.filter(pl => pl.id !== confirmDelete.player?.id));
          setConfirmDelete({ open: false, player: null, submitting: false });
        }}
        title="Delete Player"
        message={`Are you sure you want to delete ${confirmDelete.player?.name || 'this player'}? This action cannot be undone.`}
        isSubmitting={confirmDelete.submitting}
      />
    </div>
  );
}
