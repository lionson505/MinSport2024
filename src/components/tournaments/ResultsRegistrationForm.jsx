import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { locations } from '../../data/locations';
import { resultsApi, playersApi } from '../../lib/api';
import { tournamentService } from '../../services/tournamentService';

// Simple in-component UI for registering and showing results.
// In a future step, wire props and API endpoints for real data.

const defaultStages = ['1/16', '1/8', 'Quarterfinals', 'Semi-finals', 'Final'];

export default function ResultsRegistrationForm({
  season = '2025-2026',
  tournamentType = 'umurenge_kagame',
  tournamentId, // REQUIRED for API operations
  teams = [], // Provide a list like [{id, name}] based on sector/university
  province,
  district,
  sector,
  locationText,
  tournamentName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);

  const [geo, setGeo] = useState({ province: '', district: '', sector: '' });

  // Team-based players no longer needed for tournament-vs-tournament, keep states for compatibility but unused
  const [tournamentPlayers, setTournamentPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [awayTournaments, setAwayTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  // Form state must be declared before any effects that reference setForm
  const [form, setForm] = useState({
    season,
    date: '',
    stage: '',
    homeTeam: '',
    awayTeam: '',
    homeScore: '',
    awayScore: '',
    location: '',
  });

  useEffect(() => {
    // Initialize geo from tournament when tournament changes (kept for location field)
    setGeo({ province: province || '', district: district || '', sector: sector || '' });
    const loadPlayers = async () => {
      // Reset immediately to avoid showing stale options from previous tournament
      setTournamentPlayers([]);
      if (!tournamentId) return;
      try {
        setPlayersLoading(true);
        const list = await playersApi.list(tournamentId);
        const arr = Array.isArray(list) ? list : [];
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production') {
          console.debug('[Results] loaded players for tournament', tournamentId, arr.slice(0, 5));
        }
        setTournamentPlayers(arr);
      } catch (e) {
        console.error('Failed to load tournament players for results', e);
        setTournamentPlayers([]);
      } finally {
        setPlayersLoading(false);
      }
    };
    loadPlayers();
  }, [tournamentId, province, district, sector]);

  // Clear home tournament selection on tournament change (not user-editable)
  useEffect(() => {
    setForm((f) => ({ ...f, homeTeam: '' }));
  }, [tournamentId]);

  // Load tournaments list for Away selection (exclude current tournament)
  useEffect(() => {
    const loadTournaments = async () => {
      setAwayTournaments([]);
      try {
        setTournamentsLoading(true);
        const res = await tournamentService.getTournaments();
        if (res && res.success && Array.isArray(res.data)) {
          const others = res.data.filter(t => String(t.id) !== String(tournamentId));
          setAwayTournaments(others);
        } else if (Array.isArray(res)) {
          const others = res.filter(t => String(t.id) !== String(tournamentId));
          setAwayTournaments(others);
        } else {
          setAwayTournaments([]);
        }
      } catch (e) {
        console.error('Failed to load tournaments for Away selection', e);
        setAwayTournaments([]);
      } finally {
        setTournamentsLoading(false);
      }
    };
    loadTournaments();
  }, [tournamentId]);

  // No team options in tournament-vs-tournament mode
  const teamOptions = [];

  const awayTournamentOptions = useMemo(() => {
    if (tournamentsLoading) return [];
    return (awayTournaments || []).map(t => ({ value: String(t.id), label: t.name }));
  }, [awayTournaments, tournamentsLoading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onSelect = (name) => (val) => setForm((f) => ({ ...f, [name]: val }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!tournamentId) return; // cannot submit without tournamentId
    if (!form.awayTeam) return;
    const location = (geo.province && geo.district)
      ? `${geo.province} / ${geo.district}${geo.sector ? ' / ' + geo.sector : ''}`
      : (form.location || '-');
    await resultsApi.create(tournamentId, {
      season,
      date: form.date,
      stage: form.stage,
      homeTeam: tournamentName || (locationText ? String(locationText).split('/')[1]?.trim() : `Tournament #${tournamentId}`),
      awayTeam: awayTournamentOptions.find(t => t.value === form.awayTeam)?.label || form.awayTeam,
      homeScore: Number(form.homeScore ?? 0),
      awayScore: Number(form.awayScore ?? 0),
      location,
      province: geo.province || undefined,
      district: geo.district || undefined,
      sector: geo.sector || undefined,
    });
    setIsOpen(false);
    setForm((f) => ({ ...f, date: '', stage: '', homeTeam: '', awayTeam: '', homeScore: '', awayScore: '', location: '' }));
    await loadResults();
  };

  const loadResults = useMemo(() => async () => {
    if (!tournamentId) return;
    try {
      const list = await resultsApi.list(tournamentId);
      setResults(list);
    } catch (e) {
      console.error('Failed to load results', e);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const deleteResult = async (id) => {
    if (!id) return;
    await resultsApi.remove(id);
    await loadResults();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Season {season}</Badge>
          <Badge variant="secondary">{tournamentType === 'umurenge_kagame' ? 'Umurenge Kagame Cup' : 'Inter-universities'}</Badge>
        </div>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2" disabled={!tournamentId}>
          <Plus className="w-4 h-4" /> Add Result
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Home</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Away</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.stage}</TableCell>
                  <TableCell>{r.homeTeam || '-'}</TableCell>
                  <TableCell className="text-center">{r.homeScore} - {r.awayScore}</TableCell>
                  <TableCell>{r.awayTeam || '-'}</TableCell>
                  <TableCell>{r.location}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteResult(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-600">No results yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false); }}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Add Result</DialogTitle>
            <DialogDescription>
              Register a match result. Home team must come from the current tournament; the away team is selected from another tournament.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block">Season</Label>
                <Input value={form.season} disabled />
              </div>
              <div>
                <Label className="mb-1 block">Date</Label>
                <Input type="date" name="date" value={form.date} onChange={onChange} />
              </div>
              <div>
                <Label className="mb-1 block">Knockout Stage</Label>
                <Select value={form.stage} onValueChange={onSelect('stage')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultStages.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Geolocation selectors removed for tournament-vs-tournament */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label className="mb-1 block">Home Tournament</Label>
                <Input value={tournamentName || ''} disabled />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="mb-1 block">Home</Label>
                  <Input type="number" name="homeScore" value={form.homeScore} onChange={onChange} min="0" />
                </div>
                <div className="text-center pb-2 flex items-center justify-center text-gray-500">vs</div>
                <div>
                  <Label className="mb-1 block">Away</Label>
                  <Input type="number" name="awayScore" value={form.awayScore} onChange={onChange} min="0" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Away Team (Other Tournament)</Label>
                <Select value={form.awayTeam} onValueChange={onSelect('awayTeam')} disabled={tournamentsLoading || awayTournamentOptions.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={tournamentsLoading ? 'Loading tournaments...' : (awayTournamentOptions.length ? 'Select away tournament' : 'No other tournaments') } />
                  </SelectTrigger>
                  <SelectContent>
                    {awayTournamentOptions.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    {(!tournamentsLoading && awayTournamentOptions.length === 0) && (
                      <div className="px-3 py-2 text-xs text-gray-500">No other tournaments available.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="mb-1 block">Playground Location</Label>
                <Input
                  name="location"
                  value={tournamentType === 'umurenge_kagame' ? (geo.province && geo.district ? `${geo.province} / ${geo.district}${geo.sector ? ' / ' + geo.sector : ''}` : '') : form.location}
                  onChange={onChange}
                  placeholder={tournamentType === 'umurenge_kagame' ? 'Province / District / Sector' : 'e.g. Nyamirambo Stadium'}
                  disabled={tournamentType === 'umurenge_kagame'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Result</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
